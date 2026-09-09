import type { PlatformId, PlatformMeta } from '../../types';
import { cx, formatPercent } from '../../utils/format';

interface PlatformChipsProps {
  platforms: PlatformMeta[];
  selected: PlatformId[];
  onToggle: (platform: PlatformId) => void;
  error?: string;
}

/** Multi-select marketplace chips, exposed as an accessible checkbox group. */
export function PlatformChips({ platforms, selected, onToggle, error }: PlatformChipsProps) {
  return (
    <fieldset>
      <legend className="label-text">Preferred marketplaces</legend>
      <p className="mb-3 text-xs text-slate-500">
        Pick every marketplace you would consider. Bodha AI ranks them by fit.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {platforms.map((platform) => {
          const isSelected = selected.includes(platform.id);

          return (
            <label
              key={platform.id}
              className={cx(
                'group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition',
                isSelected
                  ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-500'
                  : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50',
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(platform.id)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: platform.accentColor }}
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-slate-900">{platform.name}</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    {formatPercent(platform.feePercent, 1)} fee
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                  {platform.tagline}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-danger-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
