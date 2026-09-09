/** Shared formatting and presentation helpers. */

import type { IndexLevel, PlatformId, PriceAction } from '../types';

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const rupeeFormatterPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "₹1,299" - the default for prices shown to sellers. */
export function formatCurrency(value: number): string {
  return rupeeFormatter.format(value);
}

/** "₹1,299.45" - used where the paise actually matter (profit, break-even). */
export function formatCurrencyPrecise(value: number): string {
  return rupeeFormatterPrecise.format(value);
}

/** 0.18 -> "18%" */
export function formatPercent(fraction: number, decimals = 0): string {
  return (fraction * 100).toFixed(decimals) + '%';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Tailwind classes for a Low / Medium / High badge. */
export function indexLevelClasses(level: IndexLevel, kind: 'demand' | 'competition'): string {
  // High demand is good; high competition is bad - so the same word flips colour.
  const isPositive = kind === 'demand' ? level === 'High' : level === 'Low';
  const isNegative = kind === 'demand' ? level === 'Low' : level === 'High';

  if (isPositive) return 'bg-profit-50 text-profit-700 ring-profit-200';
  if (isNegative) return 'bg-danger-50 text-danger-700 ring-danger-500/20';
  return 'bg-risk-50 text-risk-700 ring-risk-200';
}

export const PRICE_ACTION_LABELS: Record<PriceAction, string> = {
  increase: 'Raise your price',
  decrease: 'Lower your price',
  hold: 'Hold your price',
};

/**
 * Categorical palette identifying each marketplace, in fixed order.
 *
 * Colour follows the platform, never its rank - re-sorting the report never
 * repaints a bar. Validated for colour-vision deficiency across all pairs
 * (worst adjacent ΔE 10.3, deutan), because bars re-sort by fit score and any
 * two can end up side by side. Emerald is deliberately absent: it is reserved
 * throughout the app to mean "profit".
 */
export const PLATFORM_COLORS: Record<PlatformId, string> = {
  amazon: '#f59e0b',
  flipkart: '#1d4ed8',
  snapdeal: '#db2777',
  alibaba: '#0891b2',
};

export const PLATFORM_NAMES: Record<PlatformId, string> = {
  amazon: 'Amazon',
  flipkart: 'Flipkart',
  snapdeal: 'Snapdeal',
  alibaba: 'Alibaba',
};

export const CATEGORY_LABELS: Record<string, string> = {
  'electronics-accessories': 'Electronics Accessories',
  apparel: 'Apparel',
  'home-kitchen': 'Home & Kitchen',
  'beauty-personal-care': 'Beauty & Personal Care',
  toys: 'Toys',
};

/** Join class names, dropping falsy entries. */
export function cx(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}
