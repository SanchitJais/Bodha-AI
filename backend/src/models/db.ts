/**
 * SQLite persistence, backed by Node's built-in `node:sqlite` module.
 *
 * Using the runtime's own driver keeps the demo free of native build steps
 * (no node-gyp, no prebuilt binary mismatch) while still writing to a real
 * file on disk - so history survives a server restart.
 */

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { env } from '../config/env.js';

/**
 * `node:sqlite` type alias, resolved lazily when `getDatabase()` is first
 * called. This avoids crashing at module load time on runtimes (e.g. Vercel
 * serverless) where `node:sqlite` may not yet be available at import time.
 */
type DatabaseSync = InstanceType<(typeof import('node:sqlite'))['DatabaseSync']>;

let database: DatabaseSync | null = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS sellers (
    id          TEXT PRIMARY KEY,
    displayName TEXT NOT NULL,
    createdAt   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id                TEXT PRIMARY KEY,
    sellerId          TEXT NOT NULL,
    title             TEXT NOT NULL,
    description       TEXT NOT NULL,
    category          TEXT NOT NULL,
    imageUrl          TEXT,
    manufacturingCost REAL NOT NULL,
    currentPrice      REAL NOT NULL,
    createdAt         TEXT NOT NULL,
    FOREIGN KEY (sellerId) REFERENCES sellers(id)
  );

  CREATE TABLE IF NOT EXISTS analyses (
    productId          TEXT PRIMARY KEY,
    recommendedPlatform TEXT NOT NULL,
    recommendedPrice   REAL NOT NULL,
    platformsJson      TEXT NOT NULL,
    listingJson        TEXT NOT NULL,
    createdAt          TEXT NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id)
  );

  CREATE INDEX IF NOT EXISTS idx_products_seller_created
    ON products (sellerId, createdAt DESC);
`;

/**
 * Authentication is out of scope for this demo, so every analysis is attributed
 * to one mock seller session.
 */
export const DEMO_SELLER_ID = 'demo-seller';

/** Open (and on first call, create and migrate) the SQLite database. */
export function getDatabase(): DatabaseSync {
  if (database) return database;

  /**
   * Lazy-require `node:sqlite` so that importing this module does NOT crash
   * at startup on platforms where the built-in may not be initialised yet
   * (e.g. Vercel serverless cold starts). The require only runs here, the
   * first time a DB operation is actually needed.
   */
  const require = createRequire(import.meta.url);
  const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');

  const dbPath = path.resolve(env.databasePath);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  database = new DatabaseSync(dbPath);
  database.exec('PRAGMA journal_mode = WAL;');
  database.exec('PRAGMA foreign_keys = ON;');
  database.exec(SCHEMA);

  database
    .prepare('INSERT OR IGNORE INTO sellers (id, displayName, createdAt) VALUES (?, ?, ?)')
    .run(DEMO_SELLER_ID, 'Demo Seller', new Date().toISOString());

  return database;
}

/** Close the handle - used by tests and graceful shutdown. */
export function closeDatabase(): void {
  database?.close();
  database = null;
}
