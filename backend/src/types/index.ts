/**
 * Shared domain types for Bodha AI.
 *
 * These types are the contract between the pricing engine, the listing
 * optimizer, the persistence layer and the REST API. The frontend mirrors the
 * response-facing subset in `frontend/src/types/index.ts`.
 */

export type PlatformId = 'amazon' | 'flipkart' | 'snapdeal' | 'alibaba';

export type CategoryId =
  'electronics-accessories' | 'apparel' | 'home-kitchen' | 'beauty-personal-care' | 'toys';

export type IndexLevel = 'Low' | 'Medium' | 'High';

export type PriceAction = 'increase' | 'decrease' | 'hold';

/** Static, per-platform commercial configuration (mock data). */
export interface PlatformConfig {
  id: PlatformId;
  name: string;
  /** Commission taken by the marketplace, as a fraction (0.18 === 18%). */
  feePercent: number;
  /** Flat per-unit logistics cost the seller absorbs, in rupees. */
  avgShippingFee: number;
  /** True for B2B/bulk marketplaces where quoted prices are volume based. */
  isBulkMarketplace: boolean;
  tagline: string;
  accentColor: string;
}

/** Per category x platform market snapshot (mock data). */
export interface MarketSnapshot {
  /** 3-5 comparable listing prices for similar products, in rupees. */
  comparablePrices: number[];
  /** 0-100, higher means buyers are actively searching for this category. */
  demandIndex: number;
  /** 0-100, higher means more sellers fighting over the same buyers. */
  competitionIndex: number;
}

export interface Category {
  id: CategoryId;
  label: string;
  /** Seed keywords used by the rule-based listing optimizer. */
  keywordSeeds: string[];
}

/** Input accepted by the pure pricing engine. */
export interface PricingInput {
  manufacturingCost: number;
  currentPrice: number;
  category: CategoryId;
  selectedPlatforms: PlatformId[];
}

/** Per-platform result produced by the pricing engine. */
export interface PlatformRecommendation {
  id: PlatformId;
  name: string;
  feePercent: number;
  avgShippingFee: number;
  isBulkMarketplace: boolean;
  /** Median of the comparable listing prices for this category x platform. */
  marketPrice: number;
  marketPriceRange: [number, number];
  /** Lowest price that still covers cost + commission + shipping. */
  breakEvenPrice: number;
  recommendedPrice: number;
  estimatedProfit: number;
  /** estimatedProfit / recommendedPrice, as a fraction. */
  profitMargin: number;
  competitionIndex: number;
  demandIndex: number;
  competition: IndexLevel;
  demand: IndexLevel;
  fitScore: number;
  priceAction: PriceAction;
  explanation: string;
  /** True when the market price sat below break-even and the floor was applied. */
  lossRiskAvoided: boolean;
}

export interface PricingResult {
  recommendedPlatform: PlatformId;
  platforms: PlatformRecommendation[];
}

export interface OptimizedListing {
  title: string;
  description: string;
  keywords: string[];
}

/** Full analysis persisted in SQLite and returned by the API. */
export interface AnalysisRecord {
  productId: string;
  title: string;
  description: string;
  category: CategoryId;
  imageUrl: string | null;
  manufacturingCost: number;
  currentPrice: number;
  recommendedPlatform: PlatformId;
  recommendedPrice: number;
  platforms: PlatformRecommendation[];
  optimizedListing: OptimizedListing;
  createdAt: string;
}

export interface HistoryItem {
  productId: string;
  title: string;
  thumbnail: string | null;
  category: CategoryId;
  recommendedPlatform: PlatformId;
  recommendedPrice: number;
  createdAt: string;
}
