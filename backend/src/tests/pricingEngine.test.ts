/**
 * Unit tests for the pure pricing engine.
 *
 * The three cases required by the spec (Section 2.4) are grouped in the
 * "Section 2.4 - required worked examples" describe block:
 *   1. under-priced  -> "increase" toward the ~Rs.1000 market price
 *   2. over-priced   -> "decrease", still above break-even
 *   3. loss risk     -> recommendedPrice pinned to break-even, flag raised
 */

import { describe, expect, it } from 'vitest';

import { MARKET_DATA, PLATFORMS } from '../data/mockMarketplaceData.js';
import {
  analyzePlatform,
  analyzePricing,
  calculateBreakEvenPrice,
  calculateEstimatedProfit,
  calculateFitScore,
  FIT_SCORE_WEIGHTS,
  median,
  normalizeProfit,
  resolvePriceAction,
  toIndexLevel,
} from '../services/pricingEngine.js';
import type { PricingInput } from '../types/index.js';

/** Electronics Accessories on Amazon: comparables median to Rs.999. */
const ELECTRONICS_AMAZON_MEDIAN = 999;

describe('Section 2.4 - required worked examples', () => {
  it('case 1: recommends INCREASING a Rs.800 price toward the ~Rs.1000 market rate', () => {
    const input: PricingInput = {
      manufacturingCost: 400,
      currentPrice: 800,
      category: 'electronics-accessories',
      selectedPlatforms: ['amazon', 'flipkart', 'snapdeal', 'alibaba'],
    };

    const result = analyzePricing(input);
    const amazon = result.platforms.find((platform) => platform.id === 'amazon');

    expect(amazon).toBeDefined();
    if (!amazon) return;

    // Comparable products sell around Rs.1000, so that is the recommendation.
    expect(amazon.marketPrice).toBe(ELECTRONICS_AMAZON_MEDIAN);
    expect(amazon.recommendedPrice).toBe(ELECTRONICS_AMAZON_MEDIAN);
    expect(amazon.recommendedPrice).toBeGreaterThan(950);
    expect(amazon.recommendedPrice).toBeLessThan(1050);

    // The action is to raise the price, and no loss floor was needed.
    expect(amazon.priceAction).toBe('increase');
    expect(amazon.lossRiskAvoided).toBe(false);
    expect(amazon.recommendedPrice).toBeGreaterThan(amazon.breakEvenPrice);

    // Break-even: (400 + 60) / (1 - 0.18) = 560.98
    expect(amazon.breakEvenPrice).toBeCloseTo(560.98, 1);

    // Profit: 999 - (999 * 0.18) - 60 - 400 = 359.18
    expect(amazon.estimatedProfit).toBeCloseTo(359.18, 2);
    expect(amazon.profitMargin).toBeCloseTo(0.3595, 3);

    // The explanation must cite demand and competitors pricing higher.
    expect(amazon.demand).toBe('High');
    expect(amazon.explanation).toMatch(/high demand/i);
    expect(amazon.explanation).toMatch(/competitors who are already pricing higher/i);
    expect(amazon.explanation).toContain('999');

    // Every selected platform is ranked, best fit first.
    expect(result.platforms).toHaveLength(4);
    expect(result.recommendedPlatform).toBe(result.platforms[0].id);
    for (let i = 1; i < result.platforms.length; i += 1) {
      expect(result.platforms[i - 1].fitScore).toBeGreaterThanOrEqual(result.platforms[i].fitScore);
    }
  });

  it('case 2: recommends DECREASING a Rs.1400 price, staying above break-even', () => {
    const input: PricingInput = {
      manufacturingCost: 400,
      currentPrice: 1400,
      category: 'electronics-accessories',
      selectedPlatforms: ['amazon', 'flipkart'],
    };

    const result = analyzePricing(input);

    for (const platform of result.platforms) {
      expect(platform.priceAction).toBe('decrease');
      // "comfortably above" - not merely a rounding above the floor.
      expect(platform.recommendedPrice).toBeGreaterThan(platform.breakEvenPrice * 1.5);
      expect(platform.estimatedProfit).toBeGreaterThan(0);
      expect(platform.lossRiskAvoided).toBe(false);
      expect(platform.explanation).toMatch(/competitive/i);
      expect(platform.explanation).toMatch(/break-even/i);
    }

    const amazon = result.platforms.find((platform) => platform.id === 'amazon');
    expect(amazon?.recommendedPrice).toBe(ELECTRONICS_AMAZON_MEDIAN);
    expect(amazon?.breakEvenPrice).toBeCloseTo(560.98, 1);
  });

  it('case 3: never recommends below break-even when the market price is too low', () => {
    // Toys on Alibaba: comparables median to Rs.300, far below what a Rs.900
    // unit cost can support once commission and shipping are paid.
    const input: PricingInput = {
      manufacturingCost: 900,
      currentPrice: 1000,
      category: 'toys',
      selectedPlatforms: ['alibaba'],
    };

    const result = analyzePricing(input);
    const alibaba = result.platforms[0];

    const expectedBreakEven = calculateBreakEvenPrice(
      900,
      PLATFORMS.alibaba.feePercent,
      PLATFORMS.alibaba.avgShippingFee,
    );

    expect(alibaba.marketPrice).toBe(300);
    expect(alibaba.marketPrice).toBeLessThan(alibaba.breakEvenPrice);

    // The floor is applied exactly, and the flag is raised.
    expect(alibaba.recommendedPrice).toBe(alibaba.breakEvenPrice);
    expect(alibaba.recommendedPrice).toBeCloseTo(expectedBreakEven, 2);
    expect(alibaba.lossRiskAvoided).toBe(true);

    // At the floor the seller recovers manufacturing cost AND shipping, in
    // full, after commission - this is the guarantee the product makes.
    const netOfCommission = alibaba.recommendedPrice * (1 - PLATFORMS.alibaba.feePercent);
    expect(netOfCommission).toBeCloseTo(900 + PLATFORMS.alibaba.avgShippingFee, 2);

    // Selling at exactly the floor is exactly break-even - zero profit, not a
    // near-zero residual. That is what "break-even" means. (The response field
    // is rounded to 2dp, so assert against that same precision.)
    expect(alibaba.estimatedProfit).toBeCloseTo(0, 2);
    expect(alibaba.profitMargin).toBeCloseTo(0, 2);

    expect(alibaba.explanation).toMatch(/refused to suggest a loss-making price/i);
  });
});

describe('loss prevention holds across every category and platform', () => {
  it('never returns a recommended price below break-even for any combination', () => {
    const categories = Object.keys(MARKET_DATA) as (keyof typeof MARKET_DATA)[];
    const platforms = Object.keys(PLATFORMS) as (keyof typeof PLATFORMS)[];

    for (const category of categories) {
      for (const platform of platforms) {
        for (const manufacturingCost of [50, 400, 900, 2500]) {
          const recommendation = analyzePlatform(
            {
              manufacturingCost,
              currentPrice: manufacturingCost * 2,
              category,
              selectedPlatforms: [platform],
            },
            platform,
          );

          expect(recommendation.recommendedPrice).toBeGreaterThanOrEqual(
            recommendation.breakEvenPrice - 0.01,
          );

          // The headline guarantee: manufacturing cost AND shipping are always
          // recovered after commission, on every category x platform pair -
          // so estimated profit is never negative.
          const netOfCommission = recommendation.recommendedPrice * (1 - recommendation.feePercent);
          expect(netOfCommission).toBeGreaterThanOrEqual(
            manufacturingCost + recommendation.avgShippingFee - 0.01,
          );
          expect(recommendation.estimatedProfit).toBeGreaterThanOrEqual(-0.01);
        }
      }
    }
  });
});

describe('formula helpers', () => {
  it('median handles odd and even length inputs', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(() => median([])).toThrow(/at least one value/);
  });

  it('grosses cost AND shipping up together by the commission', () => {
    // (400 + 60) / (1 - 0.18)
    expect(calculateBreakEvenPrice(400, 0.18, 60)).toBeCloseTo(560.98, 1);
    // A zero-fee, zero-shipping marketplace breaks even at cost.
    expect(calculateBreakEvenPrice(400, 0, 0)).toBe(400);
    expect(() => calculateBreakEvenPrice(400, 1, 0)).toThrow(/below 1/);
  });

  it('computes profit net of commission, shipping and cost', () => {
    expect(calculateEstimatedProfit(1000, 400, 0.2, 50)).toBeCloseTo(350, 5);

    // Selling at exactly the break-even floor is exactly zero profit - the
    // floor and the profit formula agree by construction, with no residual.
    const breakEven = calculateBreakEvenPrice(400, 0.18, 60);
    expect(calculateEstimatedProfit(breakEven, 400, 0.18, 60)).toBeCloseTo(0, 6);
  });

  it('weights fit score 40/30/30 across profit, competition and demand', () => {
    expect(
      FIT_SCORE_WEIGHTS.profit + FIT_SCORE_WEIGHTS.competition + FIT_SCORE_WEIGHTS.demand,
    ).toBeCloseTo(1, 10);

    // 0.4*100 + 0.3*(100-0) + 0.3*100 = 100
    expect(calculateFitScore(100, 0, 100)).toBeCloseTo(100, 6);
    // 0.4*0 + 0.3*(100-100) + 0.3*0 = 0
    expect(calculateFitScore(0, 100, 0)).toBeCloseTo(0, 6);
    // 0.4*50 + 0.3*40 + 0.3*60 = 50
    expect(calculateFitScore(50, 60, 60)).toBeCloseTo(50, 6);
  });

  it('normalises profit against the target margin and clamps to 0-100', () => {
    expect(normalizeProfit(350, 1000)).toBeCloseTo(100, 6); // 35% margin === target
    expect(normalizeProfit(175, 1000)).toBeCloseTo(50, 6);
    expect(normalizeProfit(-100, 1000)).toBe(0);
    expect(normalizeProfit(1000, 1000)).toBe(100);
    expect(normalizeProfit(10, 0)).toBe(0);
  });

  it('applies a +/-10% dead-band before advising a re-price', () => {
    expect(resolvePriceAction(800, 1000)).toBe('increase');
    expect(resolvePriceAction(899, 1000)).toBe('increase');
    expect(resolvePriceAction(900, 1000)).toBe('hold');
    expect(resolvePriceAction(1000, 1000)).toBe('hold');
    expect(resolvePriceAction(1100, 1000)).toBe('hold');
    expect(resolvePriceAction(1101, 1000)).toBe('decrease');
  });

  it('buckets 0-100 indices into Low / Medium / High', () => {
    expect(toIndexLevel(0)).toBe('Low');
    expect(toIndexLevel(39)).toBe('Low');
    expect(toIndexLevel(40)).toBe('Medium');
    expect(toIndexLevel(69)).toBe('Medium');
    expect(toIndexLevel(70)).toBe('High');
    expect(toIndexLevel(100)).toBe('High');
  });
});

describe('analyzePricing input guards', () => {
  const base: PricingInput = {
    manufacturingCost: 400,
    currentPrice: 800,
    category: 'apparel',
    selectedPlatforms: ['amazon'],
  };

  it('rejects an empty marketplace selection', () => {
    expect(() => analyzePricing({ ...base, selectedPlatforms: [] })).toThrow(/at least one/i);
  });

  it('rejects non-positive money values', () => {
    expect(() => analyzePricing({ ...base, manufacturingCost: 0 })).toThrow(/greater than zero/i);
    expect(() => analyzePricing({ ...base, currentPrice: -5 })).toThrow(/greater than zero/i);
  });

  it('reports the marketplace price range from the comparable listings', () => {
    const [amazon] = analyzePricing(base).platforms;
    expect(amazon.marketPriceRange).toEqual([649, 1049]);
    expect(amazon.marketPrice).toBe(829);
  });
});
