import { Link, useParams } from 'react-router-dom';

import { AnalyzingSkeleton } from '../components/report/AnalyzingSkeleton';
import { OptimizedListingPanel } from '../components/report/OptimizedListingPanel';
import { PlatformCharts } from '../components/report/PlatformCharts';
import { PlatformComparison } from '../components/report/PlatformComparison';
import { PriceRecommendationPanel } from '../components/report/PriceRecommendationPanel';
import { RecommendationBanner } from '../components/report/RecommendationBanner';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useProduct } from '../hooks/useProducts';
import { ApiError } from '../services/api';
import { CATEGORY_LABELS, formatCurrency } from '../utils/format';

export function ReportPage() {
  const { productId } = useParams<{ productId: string }>();
  const { data: analysis, isLoading, isError, error } = useProduct(productId);

  if (isLoading) {
    return <AnalyzingSkeleton />;
  }

  if (isError || !analysis) {
    const isMissing = error instanceof ApiError && error.status === 404;

    return (
      <div className="section-shell py-16">
        <EmptyState
          title={isMissing ? 'That analysis no longer exists' : 'Could not load this report'}
          description={
            isMissing
              ? 'The product you are looking for is not in the database. It may have been created before the last reset.'
              : error instanceof Error
                ? error.message
                : 'Something went wrong while loading this report.'
          }
          action={
            <div className="flex gap-3">
              <Link to="/dashboard">
                <Button variant="secondary">Back to dashboard</Button>
              </Link>
              <Link to="/analyze">
                <Button>Run a new analysis</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const winner =
    analysis.platforms.find((platform) => platform.id === analysis.recommendedPlatform) ??
    analysis.platforms[0];

  return (
    <div className="section-shell space-y-8 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/dashboard" className="rounded font-medium transition hover:text-brand-700">
          Dashboard
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate font-medium text-slate-700">{analysis.title}</span>
      </nav>

      <RecommendationBanner analysis={analysis} winner={winner} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <PriceRecommendationPanel platform={winner} currentPrice={analysis.currentPrice} />
        <ProductSummaryCard analysis={analysis} />
      </div>

      <PlatformComparison
        platforms={analysis.platforms}
        recommendedPlatform={analysis.recommendedPlatform}
      />

      <PlatformCharts platforms={analysis.platforms} />

      <OptimizedListingPanel listing={analysis.optimizedListing} />

      <div className="flex flex-wrap gap-3 pt-2">
        <Link to="/analyze">
          <Button>Analyze another product</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="secondary">View all analyses</Button>
        </Link>
      </div>
    </div>
  );
}

/** The seller's own inputs, restated so the report is self-contained. */
function ProductSummaryCard({
  analysis,
}: {
  analysis: NonNullable<ReturnType<typeof useProduct>['data']>;
}) {
  return (
    <aside className="card overflow-hidden" aria-label="Product summary">
      {analysis.imageUrl ? (
        <img
          src={analysis.imageUrl}
          alt={analysis.title}
          className="h-48 w-full bg-slate-50 object-contain"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-slate-50 text-slate-300">
          <svg
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path d="M21 15l-5-5L5 20" />
          </svg>
          <span className="sr-only">No product image provided</span>
        </div>
      )}

      <div className="space-y-4 p-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">{analysis.title}</h2>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {analysis.description}
          </p>
        </div>

        <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Category</dt>
            <dd className="text-right font-semibold text-slate-900">
              {CATEGORY_LABELS[analysis.category] ?? analysis.category}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Manufacturing cost</dt>
            <dd className="tabular-nums font-semibold text-slate-900">
              {formatCurrency(analysis.manufacturingCost)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Current price</dt>
            <dd className="tabular-nums font-semibold text-slate-900">
              {formatCurrency(analysis.currentPrice)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Marketplaces compared</dt>
            <dd className="font-semibold text-slate-900">{analysis.platforms.length}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
