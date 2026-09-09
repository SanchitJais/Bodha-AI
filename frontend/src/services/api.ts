/**
 * The single HTTP entry point for the app. No component calls `fetch`
 * directly - every request goes through `request()` so error handling,
 * base-URL resolution and JSON parsing stay in one place.
 */

import type {
  AnalysisResponse,
  AnalyzeRequest,
  ApiErrorBody,
  HistoryItem,
  MetaResponse,
} from '../types';

/**
 * Empty in development so requests stay same-origin and are forwarded by the
 * Vite dev-server proxy (see vite.config.ts).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/** An API failure carrying the server's structured error payload. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: { field: string; message: string }[];

  constructor(status: number, body: ApiErrorBody | null, fallback: string) {
    super(body?.error?.message ?? fallback);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error?.code ?? 'UNKNOWN';
    this.fieldErrors = body?.error?.details ?? [];
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(API_BASE_URL + path, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    // Network-level failure: the API is unreachable rather than unhappy.
    throw new ApiError(0, null, 'Cannot reach the Bodha AI server. Is the backend running?');
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(response.status, body, 'Request failed with status ' + response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  analyzeProduct(payload: AnalyzeRequest): Promise<AnalysisResponse> {
    return request<AnalysisResponse>('/api/products/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getHistory(): Promise<HistoryItem[]> {
    return request<HistoryItem[]>('/api/products/history');
  },

  getAnalysis(productId: string): Promise<AnalysisResponse> {
    return request<AnalysisResponse>('/api/products/' + encodeURIComponent(productId));
  },

  getMeta(): Promise<MetaResponse> {
    return request<MetaResponse>('/api/meta');
  },
};
