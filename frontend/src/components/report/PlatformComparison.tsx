import { LossProtectionBadge } from './LossProtectionNotice';
import { Badge } from '../ui/Badge';
import type { PlatformId, PlatformRecommendation } from '../../types';
import {
  cx,
  formatCurrency,
  formatCurrencyPrecise,
  indexLevelClasses,
  PLATFORM_COLORS,
} from '../../utils/format';

interface PlatformComparisonProps {
  platforms: PlatformRecommendation[];
  recommendedPlatform: PlatformId;
}

/**
 * Side-by-side marketplace comparison: a table on desktop where scanning
 * columns is natural, and stacked cards on small screens where it is not.
 */
export function PlatformComparison({ platforms, recommendedPlatform }: PlatformComparisonProps) {
  return (
    <section aria-labelledby="comparison-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="comparison-heading" className="text-title font-bold text-slate-900">
            Marketplace comparison
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Ranked by fit score across every marketplace you selected.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------- Desktop: data table */}
      <div className="card hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Fee, market price range, competition, demand, estimated profit and fit score for each
              selected marketplace.
            </caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-3 font-bold">
                  Marketplace
                </th>
                <th scope="col" className="px-5 py-3 text-right font-bold">
                  Fee
                </th>
                <th scope="col" className="px-5 py-3 text-right font-bold">
                  Market range
                </th>
                <th scope="col" className="px-5 py-3 text-center font-bold">
                  Competition
                </th>
                <th scope="col" className="px-5 py-3 text-center font-bold">
                  Demand
                </th>
                <th scope="col" className="px-5 py-3 text-right font-bold">
                  Recommended
                </th>
                <th scope="col" className="px-5 py-3 text-right font-bold">
                  Profit / unit
                </th>
                <th scope="col" className="px-5 py-3 text-right font-bold">
                  Fit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {platforms.map((platform) => {
                const isWinner = platform.id === recommendedPlatform;

                return (
                  <tr
                    key={platform.id}
                    className={cx(
                      'transition',
                      isWinner ? 'bg-brand-50/50' : 'hover:bg-slate-50/70',
                    )}
                  >
                    <th scope="row" className="px-5 py-4 font-semibold text-slate-900">
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: PLATFORM_COLORS[platform.id] }}
                          aria-hidden="true"
                        />
                        <span>
                          {platform.name}
                          {isWinner && (
                            <span className="ml-2 rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Best fit
                            </span>
                          )}
                          {platform.isBulkMarketplace && (
                            <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                              Volume-based B2B pricing
                            </span>
                          )}
                        </span>
                      </span>
                    </th>
                    <td className="px-5 py-4 text-right tabular-nums text-slate-700">
                      {(platform.feePercent * 100).toFixed(1)}%
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-slate-700">
                      {formatCurrency(platform.marketPriceRange[0])} –{' '}
                      {formatCurrency(platform.marketPriceRange[1])}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge className={indexLevelClasses(platform.competition, 'competition')}>
                        {platform.competition}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge className={indexLevelClasses(platform.demand, 'demand')}>
                        {platform.demand}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="block tabular-nums font-bold text-slate-900">
                        {formatCurrency(platform.recommendedPrice)}
                      </span>
                      {platform.lossRiskAvoided && (
                        <span className="mt-1 inline-block">
                          <LossProtectionBadge marketPrice={platform.marketPrice} />
                        </span>
                      )}
                    </td>
                    <td
                      className={cx(
                        'px-5 py-4 text-right tabular-nums font-bold',
                        platform.estimatedProfit > 0 ? 'text-profit-600' : 'text-danger-600',
                      )}
                    >
                      {formatCurrencyPrecise(platform.estimatedProfit)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <FitScoreCell score={platform.fitScore} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --------------------------------------------------- Mobile: card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            isWinner={platform.id === recommendedPlatform}
          />
        ))}
      </div>
    </section>
  );
}

function FitScoreCell({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
        <span className="block h-full rounded-full bg-brand-500" style={{ width: score + '%' }} />
      </span>
      <span className="w-9 tabular-nums text-right font-bold text-slate-900">
        {score.toFixed(1)}
      </span>
    </span>
  );
}

function PlatformCard({
  platform,
  isWinner,
}: {
  platform: PlatformRecommendation;
  isWinner: boolean;
}) {
  return (
    <article className={cx('card p-5', isWinner && 'ring-2 ring-brand-500')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: PLATFORM_COLORS[platform.id] }}
            aria-hidden="true"
          />
          <h3 className="text-base font-bold text-slate-900">{platform.name}</h3>
        </div>
        {isWinner && (
          <span className="rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Best fit
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold tabular-nums tracking-tight text-slate-900">
          {formatCurrency(platform.recommendedPrice)}
        </span>
        <span className="text-xs font-semibold text-slate-500">
          fit {platform.fitScore.toFixed(1)}
        </span>
      </div>

      {platform.lossRiskAvoided && (
        <div className="mt-2">
          <LossProtectionBadge marketPrice={platform.marketPrice} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge className={indexLevelClasses(platform.demand, 'demand')}>
          {platform.demand} demand
        </Badge>
        <Badge className={indexLevelClasses(platform.competition, 'competition')}>
          {platform.competition} competition
        </Badge>
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Fee</dt>
          <dd className="tabular-nums font-semibold text-slate-900">
            {(platform.feePercent * 100).toFixed(1)}%
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Market range</dt>
          <dd className="tabular-nums font-semibold text-slate-900">
            {formatCurrency(platform.marketPriceRange[0])} –{' '}
            {formatCurrency(platform.marketPriceRange[1])}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Profit / unit</dt>
          <dd
            className={cx(
              'tabular-nums font-bold',
              platform.estimatedProfit > 0 ? 'text-profit-600' : 'text-danger-600',
            )}
          >
            {formatCurrencyPrecise(platform.estimatedProfit)}
          </dd>
        </div>
      </dl>

      {platform.isBulkMarketplace && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
          Alibaba prices are quoted per unit at volume — this assumes a bulk order.
        </p>
      )}
    </article>
  );
}
