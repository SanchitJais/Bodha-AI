/**
 * Mock marketplace dataset.
 *
 * Bodha AI deliberately makes NO live marketplace API calls. Every market
 * signal below is hand-authored to be internally consistent and plausible:
 * commissions sit inside each platform's real-world published band, B2B
 * (Alibaba) prices are lower because they are quoted per-unit at volume, and
 * demand/competition move together the way they do on real listings pages.
 *
 * Swapping in a live data source means replacing `getMarketSnapshot` with a
 * fetch against a scraper/partner API - nothing else in the engine changes.
 */

import type {
  Category,
  CategoryId,
  MarketSnapshot,
  PlatformConfig,
  PlatformId,
} from '../types/index.js';

/**
 * Platform commissions follow each marketplace's published band:
 * Amazon 15-20%, Flipkart 12-18%, Snapdeal 8-12%, Alibaba 3-6%.
 */
export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    feePercent: 0.18,
    avgShippingFee: 60,
    isBulkMarketplace: false,
    tagline: 'Largest buyer base, premium pricing tolerance',
    accentColor: '#f59e0b',
  },
  flipkart: {
    id: 'flipkart',
    name: 'Flipkart',
    feePercent: 0.15,
    avgShippingFee: 55,
    isBulkMarketplace: false,
    tagline: 'Strong metro reach with festive demand spikes',
    accentColor: '#1d4ed8',
  },
  snapdeal: {
    id: 'snapdeal',
    name: 'Snapdeal',
    feePercent: 0.1,
    avgShippingFee: 45,
    isBulkMarketplace: false,
    tagline: 'Value-first buyers, low commission drag',
    accentColor: '#db2777',
  },
  alibaba: {
    id: 'alibaba',
    name: 'Alibaba',
    feePercent: 0.045,
    avgShippingFee: 25,
    isBulkMarketplace: true,
    tagline: 'B2B / bulk - unit prices are volume based',
    accentColor: '#0891b2',
  },
};

export const PLATFORM_IDS: PlatformId[] = ['amazon', 'flipkart', 'snapdeal', 'alibaba'];

export const CATEGORIES: Record<CategoryId, Category> = {
  'electronics-accessories': {
    id: 'electronics-accessories',
    label: 'Electronics Accessories',
    keywordSeeds: ['fast charging', 'durable braided cable', 'universal compatibility'],
  },
  apparel: {
    id: 'apparel',
    label: 'Apparel',
    keywordSeeds: ['breathable fabric', 'regular fit', 'all day comfort'],
  },
  'home-kitchen': {
    id: 'home-kitchen',
    label: 'Home & Kitchen',
    keywordSeeds: ['food grade', 'easy to clean', 'space saving'],
  },
  'beauty-personal-care': {
    id: 'beauty-personal-care',
    label: 'Beauty & Personal Care',
    keywordSeeds: ['dermatologist tested', 'paraben free', 'all skin types'],
  },
  toys: {
    id: 'toys',
    label: 'Toys',
    keywordSeeds: ['BIS certified', 'non toxic material', 'screen free play'],
  },
};

export const CATEGORY_IDS: CategoryId[] = [
  'electronics-accessories',
  'apparel',
  'home-kitchen',
  'beauty-personal-care',
  'toys',
];

/**
 * Comparable listing prices (in rupees) for similar products, plus demand and
 * competition indices on a 0-100 scale, per category x platform.
 */
export const MARKET_DATA: Record<CategoryId, Record<PlatformId, MarketSnapshot>> = {
  'electronics-accessories': {
    amazon: {
      comparablePrices: [899, 949, 999, 1099, 1199],
      demandIndex: 94,
      competitionIndex: 78,
    },
    flipkart: {
      comparablePrices: [849, 929, 989, 1059, 1129],
      demandIndex: 85,
      competitionIndex: 74,
    },
    snapdeal: {
      comparablePrices: [799, 869, 949, 1019, 1089],
      demandIndex: 62,
      competitionIndex: 58,
    },
    alibaba: {
      comparablePrices: [520, 580, 640, 700, 760],
      demandIndex: 60,
      competitionIndex: 55,
    },
  },
  apparel: {
    amazon: {
      comparablePrices: [649, 749, 829, 899, 1049],
      demandIndex: 88,
      competitionIndex: 86,
    },
    flipkart: {
      comparablePrices: [599, 699, 779, 869, 999],
      demandIndex: 91,
      competitionIndex: 83,
    },
    snapdeal: {
      comparablePrices: [449, 529, 599, 679, 749],
      demandIndex: 66,
      competitionIndex: 64,
    },
    alibaba: {
      comparablePrices: [260, 310, 355, 410, 470],
      demandIndex: 58,
      competitionIndex: 61,
    },
  },
  'home-kitchen': {
    amazon: {
      comparablePrices: [1149, 1299, 1449, 1649, 1899],
      demandIndex: 82,
      competitionIndex: 69,
    },
    flipkart: {
      comparablePrices: [1049, 1229, 1379, 1549, 1799],
      demandIndex: 76,
      competitionIndex: 66,
    },
    snapdeal: {
      comparablePrices: [899, 1029, 1179, 1319, 1499],
      demandIndex: 58,
      competitionIndex: 51,
    },
    alibaba: {
      comparablePrices: [560, 640, 720, 810, 910],
      demandIndex: 64,
      competitionIndex: 47,
    },
  },
  'beauty-personal-care': {
    amazon: {
      comparablePrices: [399, 469, 549, 629, 739],
      demandIndex: 90,
      competitionIndex: 88,
    },
    flipkart: {
      comparablePrices: [369, 429, 499, 579, 669],
      demandIndex: 79,
      competitionIndex: 81,
    },
    snapdeal: {
      comparablePrices: [289, 339, 399, 459, 519],
      demandIndex: 54,
      competitionIndex: 62,
    },
    alibaba: {
      comparablePrices: [150, 185, 215, 250, 290],
      demandIndex: 49,
      competitionIndex: 58,
    },
  },
  toys: {
    amazon: {
      comparablePrices: [549, 649, 749, 879, 999],
      demandIndex: 74,
      competitionIndex: 63,
    },
    flipkart: {
      comparablePrices: [499, 589, 689, 799, 929],
      demandIndex: 70,
      competitionIndex: 59,
    },
    snapdeal: {
      comparablePrices: [399, 459, 539, 619, 719],
      demandIndex: 52,
      competitionIndex: 46,
    },
    alibaba: {
      comparablePrices: [210, 255, 300, 350, 405],
      demandIndex: 57,
      competitionIndex: 41,
    },
  },
};

/** Look up the mock market snapshot for a category x platform pair. */
export function getMarketSnapshot(category: CategoryId, platform: PlatformId): MarketSnapshot {
  const snapshot = MARKET_DATA[category]?.[platform];
  if (!snapshot) {
    throw new Error(`No market data seeded for category "${category}" on platform "${platform}"`);
  }
  return snapshot;
}

export function isPlatformId(value: string): value is PlatformId {
  return PLATFORM_IDS.includes(value as PlatformId);
}

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORY_IDS.includes(value as CategoryId);
}
