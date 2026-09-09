import { Badge } from '../ui/Badge';
import { LossProtectionNotice } from './LossProtectionNotice';
import type { PlatformRecommendation } from '../../types';
import { cx, formatCurrency, formatCurrencyPrecise, PRICE_ACTION_LABELS } from '../../utils/format';

interface PriceRecommendationPanelProps {
  platform: PlatformRecommendation;
  currentPrice: number;
}

const ACTION_STYLES: Record<PlatformRecommendation['priceAction'], string> = {
  increase: 'bg-profit-50 text-profit-700 ring-profit-200',
  decrease: 'bg-risk-50 text-risk-700 ring-risk-200',
  hold: 'bg-brand-50 text-brand-700 ring-brand-200',
};

const ACTION_ICONS: Record<PlatformRecommendation['priceAction'], string> = {
  increase: 'M12 19V5M5 12l7-7 7 7',
  decrease: 'M12 5v14M5 12l7 7 7-7',
  hold: 'M5 12h14',
};

/**
 * The price panel: current vs recommended vs break-even on one axis, so the
 * seller can see at a glance how much headroom sits above the loss floor.
 */
export function PriceRecommendationPanel({
  platform,
  currentPrice,
}: PriceRecommendationPanelProps) {
  const { breakEvenPrice, recommendedPrice, priceAction, lossRiskAvoided } = platform;

  // Scale: from just below break-even to just above the highest marker, so all
  // three markers always sit comfortably inside the track.
  const highest = Math.max(currentPrice, recommendedPrice, breakEvenPrice);
  const min = Math.max(0, breakEvenPrice * 0.75);
  const max = highest * 1.12;
  const span = Math.max(max - min, 1);

  const toPercent = (value: number) => Math.min(100, Math.max(0, ((value - min) / span) * 100));

  const markers = [
    {
      key: 'breakEven',
      label: 'Break-even',
      value: breakEvenPrice,
      color: 'bg-danger-500',
      text: 'text-danger-700',
    },
    {
      key: 'current',
      label: 'Your price',
      value: currentPrice,
      color: 'bg-slate-700',
      text: 'text-slate-700',
    },
    {
      key: 'recommended',
      label: 'Recommended',
      value: recommendedPrice,
      color: 'bg-profit-600',
      text: 'text-profit-700',
    },
  ];

  // Two markers can land on top of each other - most obviously when loss
  // protection floors the recommendation onto the break-even price. Walk them
  // left to right and drop any that crowd their neighbour onto a lower row so
  // the labels stack instead of overprinting.
  const MIN_LABEL_GAP_PERCENT = 18;
  const LABEL_ROW_HEIGHT_PX = 34;

  const positioned = markers
    .map((marker) => ({ ...marker, percent: toPercent(marker.value) }))
    .sort((a, b) => a.percent - b.percent)
    .reduce<((typeof markers)[number] & { percent: number; row: number })[]>((placed, marker) => {
      const previous = placed[placed.length - 1];
      const crowded = previous && marker.percent - previous.percent < MIN_LABEL_GAP_PERCENT;
      placed.push({ ...marker, row: crowded ? previous.row + 1 : 0 });
      return placed;
    }, []);

  const labelRows = Math.max(...positioned.map((marker) => marker.row)) + 1;

  return (
    <section className="card p-6 sm:p-7" aria-labelledby="price-panel-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="price-panel-heading" className="text-title font-bold text-slate-900">
            Price recommendation
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            On {platform.name}, your best-fit marketplace.
          </p>
        </div>

        <Badge
          className={cx('text-sm', ACTION_STYLES[priceAction])}
          icon={
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={ACTION_ICONS[priceAction]} />
            </svg>
          }
        >
          {PRICE_ACTION_LABELS[priceAction]}
        </Badge>
      </div>

      {/* --------------------------------------------------- The three prices */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <PriceStat label="Break-even" value={breakEvenPrice} tone="danger" precise />
        <PriceStat label="Your price" value={currentPrice} tone="neutral" />
        <PriceStat label="Recommended" value={recommendedPrice} tone="profit" emphasis />
      </div>

      {/* ------------------------------------------------------- Price track */}
      <div className="mt-8 pt-2" style={{ paddingBottom: 28 + labelRows * LABEL_ROW_HEIGHT_PX }}>
        <div className="relative h-2.5 rounded-full bg-slate-100">
          {/* Everything to the left of break-even is a loss - shown in red. */}
          <div
            className="absolute inset-y-0 left-0 rounded-l-full bg-danger-100"
            style={{ width: toPercent(breakEvenPrice) + '%' }}
            aria-hidden="true"
          />
          {/* The safe zone between break-even and the recommendation. */}
          <div
            className="absolute inset-y-0 bg-profit-100"
            style={{
              left: toPercent(breakEvenPrice) + '%',
              width: Math.max(0, toPercent(recommendedPrice) - toPercent(breakEvenPrice)) + '%',
            }}
            aria-hidden="true"
          />

          {positioned.map((marker) => (
            <div
              key={marker.key}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: marker.percent + '%' }}
            >
              <span
                className={cx('block h-5 w-5 rounded-full ring-4 ring-white', marker.color)}
                aria-hidden="true"
              />
              <span
                className={cx(
                  'absolute left-1/2 w-28 -translate-x-1/2 text-center text-xs font-semibold',
                  marker.text,
                )}
                style={{ top: 28 + marker.row * LABEL_ROW_HEIGHT_PX }}
              >
                <span className="block">{marker.label}</span>
                <span className="block tabular-nums text-slate-500">
                  {formatCurrency(marker.value)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {lossRiskAvoided && <LossProtectionNotice platform={platform} />}

      <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
        {platform.explanation}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
        <SummaryStat label="Commission" value={(platform.feePercent * 100).toFixed(1) + '%'} />
        <SummaryStat label="Shipping" value={formatCurrency(platform.avgShippingFee)} />
        {/* Green means money kept - a negative figure must never wear it. */}
        <SummaryStat
          label="Net profit / unit"
          value={formatCurrencyPrecise(platform.estimatedProfit)}
          tone={platform.estimatedProfit > 0 ? 'profit' : 'loss'}
        />
        <SummaryStat
          label="Margin"
          value={(platform.profitMargin * 100).toFixed(1) + '%'}
          tone={platform.profitMargin > 0 ? 'profit' : 'loss'}
        />
      </dl>
    </section>
  );
}

function PriceStat({
  label,
  value,
  tone,
  emphasis,
  precise,
}: {
  label: string;
  value: number;
  tone: 'danger' | 'neutral' | 'profit';
  emphasis?: boolean;
  precise?: boolean;
}) {
  const TONES = {
    danger: 'text-danger-600',
    neutral: 'text-slate-900',
    profit: 'text-profit-600',
  } as const;

  return (
    <div
      className={cx(
        'rounded-xl px-3 py-3 text-center ring-1 ring-inset',
        emphasis ? 'bg-profit-50/70 ring-profit-200' : 'bg-slate-50 ring-slate-200',
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={cx(
          'mt-1 tabular-nums font-extrabold tracking-tight',
          emphasis ? 'text-2xl' : 'text-xl',
          TONES[tone],
        )}
      >
        {precise ? formatCurrencyPrecise(value) : formatCurrency(value)}
      </p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'profit' | 'loss';
}) {
  const TONES = {
    profit: 'text-profit-600',
    loss: 'text-danger-600',
  } as const;

  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd
        className={cx(
          'mt-0.5 tabular-nums text-base font-bold',
          tone ? TONES[tone] : 'text-slate-900',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
