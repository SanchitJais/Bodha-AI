/**
 * Integration tests for the REST contract (Section 7 of the spec).
 * Runs against a throwaway SQLite file so it never touches demo data.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bodha-test-'));
process.env.DATABASE_PATH = path.join(tempDir, 'test.db');

let app: Express;
let closeDatabase: () => void;

beforeAll(async () => {
  // Imported after DATABASE_PATH is set so the test DB is used.
  const [{ createApp }, dbModule] = await Promise.all([
    import('../app.js'),
    import('../models/db.js'),
  ]);
  app = createApp();
  closeDatabase = dbModule.closeDatabase;
});

afterAll(() => {
  closeDatabase?.();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

const validBody = {
  title: 'USB C Fast Charging Cable',
  description: 'Nylon braided 1.5m cable supporting 65W fast charge and data sync.',
  category: 'electronics-accessories',
  imageUrl: null,
  manufacturingCost: 400,
  currentPrice: 800,
  platforms: ['amazon', 'flipkart', 'snapdeal', 'alibaba'],
};

describe('POST /api/products/analyze', () => {
  it('returns the documented response shape and persists the analysis', async () => {
    const response = await request(app).post('/api/products/analyze').send(validBody).expect(201);

    expect(response.body).toMatchObject({
      productId: expect.any(String),
      recommendedPlatform: expect.any(String),
      optimizedListing: {
        title: expect.any(String),
        description: expect.any(String),
        keywords: expect.any(Array),
      },
    });
    expect(response.body.platforms).toHaveLength(4);

    for (const platform of response.body.platforms) {
      expect(platform).toMatchObject({
        name: expect.any(String),
        feePercent: expect.any(Number),
        marketPriceRange: expect.any(Array),
        recommendedPrice: expect.any(Number),
        breakEvenPrice: expect.any(Number),
        estimatedProfit: expect.any(Number),
        profitMargin: expect.any(Number),
        competition: expect.stringMatching(/^(Low|Medium|High)$/),
        demand: expect.stringMatching(/^(Low|Medium|High)$/),
        fitScore: expect.any(Number),
        priceAction: expect.stringMatching(/^(increase|decrease|hold)$/),
        explanation: expect.any(String),
        lossRiskAvoided: expect.any(Boolean),
      });
      expect(platform.marketPriceRange).toHaveLength(2);
      expect(platform.recommendedPrice).toBeGreaterThanOrEqual(platform.breakEvenPrice - 0.01);
    }

    // The stored record round-trips through GET /:id unchanged.
    const fetched = await request(app)
      .get('/api/products/' + response.body.productId)
      .expect(200);
    expect(fetched.body.productId).toBe(response.body.productId);
    expect(fetched.body.platforms).toEqual(response.body.platforms);

    // ...and shows up in history.
    const history = await request(app).get('/api/products/history').expect(200);
    const entry = history.body.find(
      (item: { productId: string }) => item.productId === response.body.productId,
    );
    expect(entry).toMatchObject({
      title: validBody.title,
      recommendedPlatform: response.body.recommendedPlatform,
      recommendedPrice: response.body.recommendedPrice,
    });
  });

  it('rejects a manufacturing cost above the selling price with a 400', async () => {
    const response = await request(app)
      .post('/api/products/analyze')
      .send({ ...validBody, manufacturingCost: 900, currentPrice: 800 })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toMatch(/lower than the current selling price/i);
  });

  it('rejects an empty marketplace selection with a 400', async () => {
    const response = await request(app)
      .post('/api/products/analyze')
      .send({ ...validBody, platforms: [] })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toMatch(/at least one marketplace/i);
  });

  it('rejects negative money values with a 400', async () => {
    await request(app)
      .post('/api/products/analyze')
      .send({ ...validBody, manufacturingCost: -1 })
      .expect(400);
  });
});

describe('GET /api/products/:id', () => {
  it('returns a structured 404 for an unknown product', async () => {
    const response = await request(app).get('/api/products/does-not-exist').expect(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/meta', () => {
  it('lists the five seeded categories and four marketplaces', async () => {
    const response = await request(app).get('/api/meta').expect(200);
    expect(response.body.categories).toHaveLength(5);
    expect(response.body.platforms).toHaveLength(4);
  });
});
