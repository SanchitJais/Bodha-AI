/**
 * Response-facing types, mirroring `backend/src/types/index.ts`.
 * Kept as a hand-maintained copy so the frontend builds independently.
 */

export type PlatformId = 'amazon' | 'flipkart' | 'snapdeal' | 'alibaba';

export type CategoryId =
  'electronics-accessories' | 'apparel' | 'home-kitchen' | 'beauty-personal-care' | 'toys';

export type IndexLevel = 'Low' | 'Medium' | 'High';

export type PriceAction = 'increase' | 'decrease' | 'hold';

export interface PlatformRecommendation {
  id: PlatformId;
  name: string;
  feePercent: number;
  avgShippingFee: number;
  isBulkMarketplace: boolean;
  marketPrice: number;
  marketPriceRange: [number, number];
  breakEvenPrice: number;
  recommendedPrice: number;
  estimatedProfit: number;
  profitMargin: number;
  competitionIndex: number;
  demandIndex: number;
  competition: IndexLevel;
  demand: IndexLevel;
  fitScore: number;
  priceAction: PriceAction;
  explanation: string;
  lossRiskAvoided: boolean;
}

export interface OptimizedListing {
  title: string;
  description: string;
  keywords: string[];
}

export interface AnalysisResponse {
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

export interface AnalyzeRequest {
  title: string;
  description: string;
  category: CategoryId;
  imageUrl: string | null;
  manufacturingCost: number;
  currentPrice: number;
  platforms: PlatformId[];
}

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  feePercent: number;
  tagline: string;
  isBulkMarketplace: boolean;
  accentColor: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
}

export interface MetaResponse {
  categories: CategoryMeta[];
  platforms: PlatformMeta[];
}

/** Structured error body returned by every failing API call. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}
