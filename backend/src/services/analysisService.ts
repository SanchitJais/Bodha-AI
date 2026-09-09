/**
 * analysisService - orchestration layer.
 *
 * Composes the two pure modules (pricingEngine, listingOptimizer) with
 * persistence. This is the only place that knows about clocks, IDs and the
 * database, which keeps the business logic itself pure and testable.
 */

import { randomUUID } from 'node:crypto';

import { findAnalysisById, listHistory, saveAnalysis } from '../models/productRepository.js';
import { optimizeListing } from './listingOptimizer.js';
import { analyzePricing } from './pricingEngine.js';
import type { AnalysisRecord, CategoryId, HistoryItem, PlatformId } from '../types/index.js';
import type { AnalyzeRequest } from '../utils/validation.js';

/** Run a full analysis and persist it, returning the stored record. */
export async function createAnalysis(request: AnalyzeRequest): Promise<AnalysisRecord> {
  const pricing = analyzePricing({
    manufacturingCost: request.manufacturingCost,
    currentPrice: request.currentPrice,
    category: request.category as CategoryId,
    selectedPlatforms: request.platforms as PlatformId[],
  });

  const winner = pricing.platforms[0];

  const optimizedListing = await optimizeListing({
    title: request.title,
    description: request.description,
    category: request.category as CategoryId,
    recommendedPlatform: pricing.recommendedPlatform,
    recommendedPrice: winner.recommendedPrice,
  });

  const record: AnalysisRecord = {
    productId: randomUUID(),
    title: request.title,
    description: request.description,
    category: request.category as CategoryId,
    imageUrl: request.imageUrl ?? null,
    manufacturingCost: request.manufacturingCost,
    currentPrice: request.currentPrice,
    recommendedPlatform: pricing.recommendedPlatform,
    recommendedPrice: winner.recommendedPrice,
    platforms: pricing.platforms,
    optimizedListing,
    createdAt: new Date().toISOString(),
  };

  saveAnalysis(record);
  return record;
}

export function getAnalysis(productId: string): AnalysisRecord | null {
  return findAnalysisById(productId);
}

export function getHistory(): HistoryItem[] {
  return listHistory();
}
