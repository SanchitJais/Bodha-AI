import { Link } from 'react-router-dom';

import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useHistory } from '../hooks/useProducts';
import type { HistoryItem } from '../types';
import {
  CATEGORY_LABELS,
  formatCurrency,
  formatDate,
  PLATFORM_COLORS,
  PLATFORM_NAMES,
} from '../utils/format';

export function DashboardPage() {
  const { data: history, isLoading, isError, error } = useHistory();

  return (
    <div className="section-shell py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-2 text-base text-slate-600">
            Every product you have analysed, newest first. Open one to revisit its full report.
          </p>
        </div>

        <Link to="/analyze">
          <Button
            icon={
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          >
            New analysis
          </Button>
        </Link>
      </header>

      <div className="mt-8">
        {isLoading && <HistorySkeleton />}

        {isError && (
          <div
            role="alert"
            className="rounded-xl border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700"
          >
            {error instanceof Error
              ? error.message
              : 'Could not load your analysis history. Please try again.'}
          </div>
        )}

        {!isLoading && !isError && history?.length === 0 && (
          <EmptyState
            title="No analyses yet"
            description="Run your first analysis and Bodha AI will recommend the best marketplace, the right price, and listing copy you can paste straight in."
            action={
              <Link to="/analyze">
                <Button size="lg">Analyze your first product</Button>
              </Link>
            }
          />
        )}

        {!isLoading && !isError && history && history.length > 0 && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {history.length} {history.length === 1 ? 'analysis' : 'analyses'} saved
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((item) => (
                <li key={item.productId}>
                  <HistoryCard item={item} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <Link
      to={'/report/' + item.productId}
      className="card group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lifted"
    >
      {item.thumbnail ? (
        <img
          src={item.thumbnail}
          alt=""
          className="h-40 w-full bg-slate-50 object-contain"
          loading="lazy"
        />
      ) : (
        <div
          className="flex h-40 items-center justify-center bg-slate-50 text-slate-300"
          aria-hidden="true"
        >
          <svg
            className="h-10 w-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path d="M21 15l-5-5L5 20" />
          </svg>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <Badge className="self-start bg-slate-100 text-slate-600 ring-slate-200">
          {CATEGORY_LABELS[item.category] ?? item.category}
        </Badge>

        <h2 className="mt-3 line-clamp-2 text-base font-bold text-slate-900 transition group-hover:text-brand-700">
          {item.title}
        </h2>

        <div className="mt-auto space-y-3 pt-4">
          <div className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: PLATFORM_COLORS[item.recommendedPlatform] }}
              aria-hidden="true"
            />
            <span className="font-semibold text-slate-700">
              {PLATFORM_NAMES[item.recommendedPlatform]}
            </span>
            <span className="ml-auto tabular-nums text-base font-extrabold text-profit-600">
              {formatCurrency(item.recommendedPrice)}
            </span>
          </div>

          <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
            {formatDate(item.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function HistorySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <div key={index} className="skeleton h-72 rounded-2xl" />
      ))}
    </div>
  );
}
