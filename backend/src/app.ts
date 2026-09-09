/**
 * Express application wiring. Kept separate from `index.ts` so integration
 * tests can mount the app without binding a port.
 */

import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';

import { env } from './config/env.js';
import { CATEGORIES, PLATFORMS } from './data/mockMarketplaceData.js';
import { productRoutes } from './routes/productRoutes.js';
import { isUsingMockOptimizer } from './services/listingOptimizer.js';
import { HttpError } from './utils/httpError.js';

export function createApp(): express.Express {
  const app = express();

  // Product images arrive as downscaled data URLs, so allow a generous body.
  app.use(express.json({ limit: '8mb' }));
  app.use(cors({ origin: env.corsOrigins }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      listingOptimizer: isUsingMockOptimizer() ? 'rule-based-mock' : 'llm',
    });
  });

  /** Reference data used to populate the frontend's form controls. */
  app.get('/api/meta', (_req: Request, res: Response) => {
    res.json({
      categories: Object.values(CATEGORIES).map(({ id, label }) => ({ id, label })),
      platforms: Object.values(PLATFORMS).map((platform) => ({
        id: platform.id,
        name: platform.name,
        feePercent: platform.feePercent,
        tagline: platform.tagline,
        isBulkMarketplace: platform.isBulkMarketplace,
        accentColor: platform.accentColor,
      })),
    });
  });

  app.use('/api/products', productRoutes);

  app.use((req: Request, res: Response) => {
    res
      .status(404)
      .json(HttpError.notFound('No route matches ' + req.method + ' ' + req.path).toBody());
  });

  // Central error handler - the only place that formats an error response.
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      res.status(error.status).json(error.toBody());
      return;
    }

    console.error('[bodha-ai] unhandled error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong while processing your request.',
      },
    });
  });

  return app;
}
