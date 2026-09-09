import type { OptimizedListing } from '../../types';
import { CopyButton } from '../ui/CopyButton';

interface OptimizedListingPanelProps {
  listing: OptimizedListing;
}

/** Marketplace-ready copy, each block independently copyable. */
export function OptimizedListingPanel({ listing }: OptimizedListingPanelProps) {
  return (
    <section className="card p-6 sm:p-7" aria-labelledby="listing-heading">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h10M4 18h7M16.5 15.5l2 2 4-4.5" />
          </svg>
        </div>
        <div>
          <h2 id="listing-heading" className="text-title font-bold text-slate-900">
            Optimized listing
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Rewritten for marketplace search. Copy each block straight into your listing form.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <ListingBlock label="Title" copyValue={listing.title}>
          <p className="text-sm font-semibold leading-relaxed text-slate-900">{listing.title}</p>
        </ListingBlock>

        <ListingBlock label="Description" copyValue={listing.description}>
          <div className="space-y-2.5">
            {listing.description.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
        </ListingBlock>

        <ListingBlock label="Keywords" copyValue={listing.keywords.join(', ')}>
          <ul className="flex flex-wrap gap-2">
            {listing.keywords.map((keyword) => (
              <li
                key={keyword}
                className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-100"
              >
                {keyword}
              </li>
            ))}
          </ul>
        </ListingBlock>
      </div>
    </section>
  );
}

function ListingBlock({
  label,
  copyValue,
  children,
}: {
  label: string;
  copyValue: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</h3>
        <CopyButton value={copyValue} label={label} />
      </div>
      {children}
    </div>
  );
}
