import type { AnalysisResponse, PlatformRecommendation } from '../../types';
import {
  CATEGORY_LABELS,
  formatCurrency,
  formatDateTime,
  PLATFORM_COLORS,
} from '../../utils/format';

interface RecommendationBannerProps {
  analysis: AnalysisResponse;
  winner: PlatformRecommendation;
}

/**
 * Condense the winning platform into a single plain-English sentence.
 *
 * The full, evidence-citing paragraph lives in the price panel below; repeating
 * it here would just be the same text twice on one screen.
 */
function buildSummary(winner: PlatformRecommendation, currentPrice: number): string {
  const price = formatCurrency(winner.recommendedPrice);
  const demand = winner.demand.toLowerCase();
  const competition = winner.competition.toLowerCase();

  if (winner.lossRiskAvoided) {
    return (
      'The market here sits below your break-even, so we floored the price at ' +
      price +
      ' rather than suggest a loss.'
    );
  }

  if (winner.priceAction === 'increase') {
    return (
      'Raise from ' +
      formatCurrency(currentPrice) +
      ' to ' +
      price +
      ' — ' +
      demand +
      ' demand and comparable listings already priced higher.'
    );
  }

  if (winner.priceAction === 'decrease') {
    return (
      'Come down from ' +
      formatCurrency(currentPrice) +
      ' to ' +
      price +
      ' to stay competitive, still well clear of your break-even.'
    );
  }

  return (
    'Your ' +
    formatCurrency(currentPrice) +
    ' price is already well positioned against ' +
    competition +
    ' competition here — no change needed.'
  );
}

/** The headline answer: where to sell, at what price, and why - in one line. */
export function RecommendationBanner({ analysis, winner }: RecommendationBannerProps) {
  const delta = winner.recommendedPrice - analysis.currentPrice;
  const deltaPercent = (delta / analysis.currentPrice) * 100;
  const summary = buildSummary(winner, analysis.currentPrice);

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-brand-900 p-6 shadow-lifted sm:p-8"
      aria-labelledby="recommendation-heading"
    >
      <div
        className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-brand-100 ring-1 ring-inset ring-white/20">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: PLATFORM_COLORS[winner.id] }}
              aria-hidden="true"
            />
            Recommended marketplace
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-brand-100 ring-1 ring-inset ring-white/20">
            {CATEGORY_LABELS[analysis.category] ?? analysis.category}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1
              id="recommendation-heading"
              className="text-3xl font-extrabold tracking-tight text-white sm:text-headline"
            >
              Sell on {winner.name} at {formatCurrency(winner.recommendedPrice)}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-brand-100">{summary}</p>
          </div>

          <dl className="flex shrink-0 gap-3">
            <BannerStat label="Your price" value={formatCurrency(analysis.currentPrice)} />
            <BannerStat
              label="Recommended"
              value={formatCurrency(winner.recommendedPrice)}
              emphasis
            />
            <BannerStat
              label="Change"
              value={(delta >= 0 ? '+' : '−') + Math.abs(deltaPercent).toFixed(1) + '%'}
              tone={Math.abs(deltaPercent) < 10 ? 'neutral' : delta > 0 ? 'up' : 'down'}
            />
          </dl>
        </div>

        <p className="mt-6 border-t border-white/15 pt-4 text-xs text-brand-200">
          {analysis.title} · analysed {formatDateTime(analysis.createdAt)}
        </p>
      </div>
    </section>
  );
}

function BannerStat({
  label,
  value,
  emphasis,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  tone?: 'neutral' | 'up' | 'down';
}) {
  const TONES = {
    neutral: 'text-white',
    up: 'text-profit-200',
    down: 'text-risk-200',
  } as const;

  return (
    <div
      className={
        'rounded-2xl px-4 py-3 text-center ring-1 ring-inset ' +
        (emphasis ? 'bg-white/15 ring-white/25' : 'bg-white/5 ring-white/10')
      }
    >
      <dt className="text-[11px] font-bold uppercase tracking-wide text-brand-200">{label}</dt>
      <dd
        className={
          'mt-1 tabular-nums font-extrabold tracking-tight ' +
          (emphasis ? 'text-2xl ' : 'text-xl ') +
          TONES[tone]
        }
      >
        {value}
      </dd>
    </div>
  );
}
