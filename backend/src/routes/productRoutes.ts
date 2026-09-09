/**
 * REST routes for products and analyses.
 *
 *   POST /api/products/analyze
 *   GET  /api/products/history
 *   GET  /api/products/:id
 */

import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

import { createAnalysis, getAnalysis, getHistory } from '../services/analysisService.js';
import { HttpError } from '../utils/httpError.js';
import { parseAnalyzeRequest } from '../utils/validation.js';

export const productRoutes = Router();

productRoutes.post(
  '/analyze',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = parseAnalyzeRequest(req.body);
      const record = await createAnalysis(parsed);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  },
);

// Declared before '/:id' so "history" is never mistaken for a product id.
productRoutes.get('/history', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    res.json(getHistory());
  } catch (error) {
    next(error);
  }
});

productRoutes.get('/:id', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const productId = String(req.params.id);
    const record = getAnalysis(productId);
    if (!record) {
      throw HttpError.notFound('No analysis found for product "' + productId + '"');
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
});
