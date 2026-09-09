import type { PlatformRecommendation } from '../../types';
import { formatCurrency, formatCurrencyPrecise } from '../../utils/format';

/**
 * Shown whenever `lossRiskAvoided` is true - i.e. the going market rate sat
 * below the break-even floor and Bodha AI refused to follow it down.
 */
export function LossProtectionNotice({ platform }: { platform: PlatformRecommendation }) {
  return (
    <div role="note" className="mt-6 flex gap-3 rounded-xl border border-risk-200 bg-risk-50 p-4">
      <svg
        className="mt-0.5 h-5 w-5 shrink-0 text-risk-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3l8 3.5v5c0 4.6-3.4 8.4-8 9.5-4.6-1.1-8-4.9-8-9.5v-5L12 3z" />
        <path d="M9.5 12.2l1.9 1.9 3.4-3.9" />
      </svg>

      <div className="min-w-0">
        <p className="text-sm font-bold text-risk-700">Loss protection applied</p>
        <p className="mt-1 text-sm leading-relaxed text-risk-700/90">
          Comparable products on {platform.name} sell for about{' '}
          <strong className="font-semibold">{formatCurrency(platform.marketPrice)}</strong>, which
          is <em>below</em> your break-even of{' '}
          <strong className="font-semibold">
            {formatCurrencyPrecise(platform.breakEvenPrice)}
          </strong>
          . Rather than suggest a price that loses you money, Bodha AI has floored the
          recommendation at break-even. Expect slower sell-through here, or bring your manufacturing
          cost down before committing to this marketplace.
        </p>
      </div>
    </div>
  );
}

/** Compact inline badge used in the comparison table and platform cards. */
export function LossProtectionBadge({ marketPrice }: { marketPrice: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-risk-50 px-2 py-0.5 text-[11px] font-bold text-risk-700 ring-1 ring-inset ring-risk-200"
      title={
        'The market rate here (' +
        formatCurrency(marketPrice) +
        ') is below your break-even, so the price was floored instead of lowered.'
      }
    >
      <svg
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3l8 3.5v5c0 4.6-3.4 8.4-8 9.5-4.6-1.1-8-4.9-8-9.5v-5L12 3z" />
      </svg>
      Loss protected
    </span>
  );
}
