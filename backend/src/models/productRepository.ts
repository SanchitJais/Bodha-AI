/**
 * Data access for products and their analyses. All SQL lives here so services
 * and routes stay free of persistence details.
 */

import { DEMO_SELLER_ID, getDatabase } from './db.js';
import type {
  AnalysisRecord,
  CategoryId,
  HistoryItem,
  OptimizedListing,
  PlatformId,
  PlatformRecommendation,
} from '../types/index.js';

interface ProductRow {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  manufacturingCost: number;
  currentPrice: number;
  createdAt: string;
  recommendedPlatform: string;
  recommendedPrice: number;
  platformsJson: string;
  listingJson: string;
}

interface HistoryRow {
  id: string;
  title: string;
  imageUrl: string | null;
  category: string;
  recommendedPlatform: string;
  recommendedPrice: number;
  createdAt: string;
}

const SELECT_FULL = `
  SELECT p.id, p.title, p.description, p.category, p.imageUrl,
         p.manufacturingCost, p.currentPrice, p.createdAt,
         a.recommendedPlatform, a.recommendedPrice, a.platformsJson, a.listingJson
  FROM products p
  JOIN analyses a ON a.productId = p.id
`;

function toAnalysisRecord(row: ProductRow): AnalysisRecord {
  return {
    productId: row.id,
    title: row.title,
    description: row.description,
    category: row.category as CategoryId,
    imageUrl: row.imageUrl,
    manufacturingCost: row.manufacturingCost,
    currentPrice: row.currentPrice,
    recommendedPlatform: row.recommendedPlatform as PlatformId,
    recommendedPrice: row.recommendedPrice,
    platforms: JSON.parse(row.platformsJson) as PlatformRecommendation[],
    optimizedListing: JSON.parse(row.listingJson) as OptimizedListing,
    createdAt: row.createdAt,
  };
}

/** Persist a product plus its analysis in a single transaction. */
export function saveAnalysis(record: AnalysisRecord, sellerId: string = DEMO_SELLER_ID): void {
  const db = getDatabase();

  db.exec('BEGIN');
  try {
    db.prepare(
      `INSERT INTO products
         (id, sellerId, title, description, category, imageUrl, manufacturingCost, currentPrice, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      record.productId,
      sellerId,
      record.title,
      record.description,
      record.category,
      record.imageUrl,
      record.manufacturingCost,
      record.currentPrice,
      record.createdAt,
    );

    db.prepare(
      `INSERT INTO analyses
         (productId, recommendedPlatform, recommendedPrice, platformsJson, listingJson, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      record.productId,
      record.recommendedPlatform,
      record.recommendedPrice,
      JSON.stringify(record.platforms),
      JSON.stringify(record.optimizedListing),
      record.createdAt,
    );

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/** Full stored analysis for one product, or null when it does not exist. */
export function findAnalysisById(productId: string): AnalysisRecord | null {
  const row = getDatabase()
    .prepare(SELECT_FULL + ' WHERE p.id = ?')
    .get(productId) as unknown as ProductRow | undefined;

  return row ? toAnalysisRecord(row) : null;
}

/** Newest-first history summary for the seller's dashboard. */
export function listHistory(sellerId: string = DEMO_SELLER_ID, limit = 50): HistoryItem[] {
  const rows = getDatabase()
    .prepare(
      `SELECT p.id, p.title, p.imageUrl, p.category,
              a.recommendedPlatform, a.recommendedPrice, p.createdAt
       FROM products p
       JOIN analyses a ON a.productId = p.id
       WHERE p.sellerId = ?
       ORDER BY p.createdAt DESC
       LIMIT ?`,
    )
    .all(sellerId, limit) as unknown as HistoryRow[];

  return rows.map((row) => ({
    productId: row.id,
    title: row.title,
    thumbnail: row.imageUrl,
    category: row.category as CategoryId,
    recommendedPlatform: row.recommendedPlatform as PlatformId,
    recommendedPrice: row.recommendedPrice,
    createdAt: row.createdAt,
  }));
}
