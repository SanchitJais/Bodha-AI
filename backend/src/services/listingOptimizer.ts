/**
 * listingOptimizer - turns a seller's raw listing into a marketplace-ready one.
 *
 * ============================================================================
 * MOCKED vs REAL
 * ============================================================================
 * No LLM API key ships with this demo, so the default implementation is
 * `ruleBasedOptimizer` - a deterministic, template-driven rewriter. It is pure
 * (no network, no UI, no database), which is what makes it unit-testable.
 *
 * It deliberately has the SAME signature as a real LLM-backed implementation
 * would:
 *
 *     (input: ListingOptimizerInput) => Promise<OptimizedListing>
 *
 * To switch to a live LLM, implement `llmOptimizer` with that signature and
 * change the ONE line marked `SWAP POINT` at the bottom of this file. Nothing
 * else in the codebase needs to change - `analysisService` only ever calls
 * `optimizeListing`.
 * ============================================================================
 */

import { CATEGORIES, PLATFORMS } from '../data/mockMarketplaceData.js';
import type { CategoryId, OptimizedListing, PlatformId } from '../types/index.js';

export interface ListingOptimizerInput {
  title: string;
  description: string;
  category: CategoryId;
  recommendedPlatform: PlatformId;
  recommendedPrice: number;
}

/** Max characters for a marketplace title before it gets truncated in search. */
const MAX_TITLE_LENGTH = 120;
const MIN_KEYWORDS = 3;
const MAX_KEYWORDS = 5;

/** Filler words that waste characters in a search-indexed title. */
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'for',
  'with',
  'this',
  'that',
  'is',
  'are',
  'it',
  'to',
  'in',
  'on',
  'very',
  'nice',
  'good',
  'best',
  'quality',
]);

/** Benefit phrases the rule-based writer appends per category. */
const CATEGORY_BENEFITS: Record<CategoryId, string> = {
  'electronics-accessories':
    'Built for daily use with reliable performance and wide device compatibility.',
  apparel: 'Cut for everyday comfort with fabric that holds its shape wash after wash.',
  'home-kitchen': 'Designed to save counter space while standing up to daily kitchen use.',
  'beauty-personal-care': 'Gentle enough for daily use and suitable for all skin types.',
  toys: 'Safe, sturdy and built to survive real play, not just the unboxing.',
};

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** Pull the most meaningful words out of the seller's own copy. */
function extractSalientTerms(source: string, limit: number): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const rawWord of collapseWhitespace(source).split(' ')) {
    const word = rawWord.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    if (word.length < 4 || STOP_WORDS.has(word) || seen.has(word)) continue;
    seen.add(word);
    terms.push(word);
    if (terms.length >= limit) break;
  }

  return terms;
}

/**
 * Build an SEO-shaped title: <Product> - <benefit hook> | <Category>.
 * Truncates on a word boundary so it never gets cut mid-word in search.
 */
function buildTitle(input: ListingOptimizerInput): string {
  const categoryLabel = CATEGORIES[input.category].label;
  // Title-case the seller's words, but leave acronyms (USB) and spec tokens
  // (65W, 1.5m) exactly as typed - re-casing those hurts search matching.
  const base = collapseWhitespace(input.title)
    .split(' ')
    .map((word) => {
      const hasDigit = /\d/.test(word);
      const isAcronym = word.length > 1 && word === word.toUpperCase();
      return hasDigit || isAcronym ? word : titleCase(word);
    })
    .join(' ');

  const hook = CATEGORIES[input.category].keywordSeeds[0];
  const composed = base + ' - ' + titleCase(hook) + ' | ' + categoryLabel;

  if (composed.length <= MAX_TITLE_LENGTH) return composed;

  const truncated = composed.slice(0, MAX_TITLE_LENGTH);
  return truncated.slice(0, truncated.lastIndexOf(' ')).replace(/[-|,\s]+$/, '');
}

/**
 * Rewrite the description into a scannable, three-part block: a benefit-led
 * opening, the seller's own detail, and a closing trust line naming the
 * recommended marketplace.
 */
function buildDescription(input: ListingOptimizerInput): string {
  const platformName = PLATFORMS[input.recommendedPlatform].name;
  const categoryLabel = CATEGORIES[input.category].label.toLowerCase();
  const sellerCopy = collapseWhitespace(input.description);
  const detail = sellerCopy.endsWith('.') ? sellerCopy : sellerCopy + '.';

  return [
    CATEGORY_BENEFITS[input.category],
    detail,
    'Listed in ' +
      categoryLabel +
      ' and priced for ' +
      platformName +
      ' buyers at ₹' +
      Math.round(input.recommendedPrice).toLocaleString('en-IN') +
      '. Dispatched quickly with secure packaging.',
  ].join('\n\n');
}

/**
 * Blend category seed keywords with terms lifted from the seller's own copy,
 * always returning between MIN_KEYWORDS and MAX_KEYWORDS entries.
 */
function buildKeywords(input: ListingOptimizerInput): string[] {
  const seeds = CATEGORIES[input.category].keywordSeeds;
  const fromSeller = extractSalientTerms(input.title + ' ' + input.description, MAX_KEYWORDS);

  const merged: string[] = [];
  const seen = new Set<string>();

  for (const candidate of [...seeds, ...fromSeller]) {
    const keyword = candidate.toLowerCase().trim();
    if (!keyword || seen.has(keyword)) continue;

    // Skip a single word that a longer phrase already covers ("charging" when
    // "fast charging" is present) - marketplaces index the phrase either way.
    if (merged.some((existing) => existing.split(' ').includes(keyword))) continue;

    seen.add(keyword);
    merged.push(keyword);
    if (merged.length >= MAX_KEYWORDS) break;
  }

  // Guarantee the documented floor even for very sparse seller input.
  while (merged.length < MIN_KEYWORDS) {
    merged.push(CATEGORIES[input.category].label.toLowerCase());
  }

  return merged.slice(0, MAX_KEYWORDS);
}

/**
 * Deterministic, dependency-free listing rewriter. Pure function: same input
 * always yields the same output, which is what the unit tests rely on.
 */
export async function ruleBasedOptimizer(input: ListingOptimizerInput): Promise<OptimizedListing> {
  return {
    title: buildTitle(input),
    description: buildDescription(input),
    keywords: buildKeywords(input),
  };
}

/**
 * SWAP POINT - change this single assignment to route through a real LLM.
 *
 * Example once an LLM-backed implementation exists:
 *   export const optimizeListing = process.env.LLM_API_KEY ? llmOptimizer : ruleBasedOptimizer;
 */
export const optimizeListing: (input: ListingOptimizerInput) => Promise<OptimizedListing> =
  ruleBasedOptimizer;

/** True when listing copy is generated by templates rather than a live model. */
export const isUsingMockOptimizer = (): boolean => optimizeListing === ruleBasedOptimizer;
