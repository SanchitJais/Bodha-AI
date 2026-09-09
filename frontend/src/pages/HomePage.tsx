import { Link } from 'react-router-dom';

import { Badge } from '../components/ui/Badge';
import type { PlatformId } from '../types';
import { formatCurrency, PLATFORM_COLORS } from '../utils/format';

const FEATURES = [
  {
    title: 'Compare Platforms',
    description:
      'Score Amazon, Flipkart, Snapdeal and Alibaba side by side on commission, demand, competition and the profit you actually keep.',
    icon: <path d="M3 3v18h18M7 15l3.5-4 3 3L21 6" />,
    accent: 'bg-brand-50 text-brand-600',
  },
  {
    title: 'Smart Pricing',
    description:
      'Get an ideal price backed by comparable listings - and a hard floor that never dips below your manufacturing cost plus platform fees.',
    icon: (
      <>
        <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-7.2-7.2a2 2 0 01-.6-1.4V4.5a1.5 1.5 0 011.5-1.5h7.5a2 2 0 011.4.6l7.4 7.4a2 2 0 010 2.4z" />
        <circle cx="7.5" cy="7.5" r="1.2" />
      </>
    ),
    accent: 'bg-profit-50 text-profit-600',
  },
  {
    title: 'Listing Optimizer',
    description:
      'Rewrite your title and description for search, and get SEO keywords you can paste straight into the marketplace form.',
    icon: <path d="M4 6h16M4 12h10M4 18h7M16.5 15.5l2 2 4-4.5" />,
    accent: 'bg-risk-50 text-risk-600',
  },
];

const STATS = [
  { value: '4', label: 'Marketplaces compared' },
  { value: '5', label: 'Product categories' },
  { value: '₹0', label: 'Loss-making prices suggested' },
];

export function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="grid-backdrop absolute inset-0" aria-hidden="true" />
        <div
          className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-brand-200/35 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-profit-100/50 blur-3xl"
          aria-hidden="true"
        />

        <div className="section-shell relative grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="animate-fade-up">
            <Badge className="bg-brand-50 text-brand-700 ring-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              AI marketplace intelligence for sellers
            </Badge>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-display">
              Know exactly{' '}
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                where to sell
              </span>{' '}
              and what to charge.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Bodha AI reads your product economics against comparable listings across four
              marketplaces, then tells you the best platform, the right price and the listing copy
              to use — and it will never recommend a price that loses you money.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/analyze"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lifted transition hover:bg-brand-700 active:bg-brand-800"
              >
                Get Started
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50"
              >
                View past analyses
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-2xl font-extrabold tracking-tight text-slate-900">
                      {stat.value}
                    </span>
                    <span className="mt-0.5 block text-ambient text-slate-500">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* A miniature of the real report, so the value is obvious immediately. */}
          <div className="animate-fade-up lg:pl-6" style={{ animationDelay: '80ms' }}>
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section className="section-shell py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-headline font-extrabold tracking-tight text-slate-900">
            Three decisions, answered in one pass
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Upload a product once. Bodha AI handles the marketplace choice, the price and the copy.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="card group p-7 transition duration-200 hover:-translate-y-1 hover:shadow-lifted"
            >
              <div
                className={
                  'flex h-12 w-12 items-center justify-center rounded-xl ' + feature.accent
                }
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {feature.icon}
                </svg>
              </div>

              <h3 className="mt-5 text-title font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- Loss protection */}
      <section className="section-shell pb-20">
        <div className="overflow-hidden rounded-3xl bg-brand-900 shadow-lifted">
          <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <Badge className="bg-white/10 text-brand-100 ring-white/20">Built-in guarantee</Badge>
              <h2 className="mt-4 text-headline font-extrabold tracking-tight text-white">
                We will never tell you to sell at a loss.
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-brand-100">
                Every recommendation is clamped to a break-even floor computed from your
                manufacturing cost, the marketplace commission and shipping. When the going market
                rate sits below that floor, Bodha AI says so plainly instead of quietly suggesting a
                cheaper price.
              </p>
              <Link
                to="/analyze"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
              >
                Try it with your product
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-inset ring-white/15 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-200">
                Break-even floor
              </p>
              <p className="mt-3 font-mono text-sm leading-relaxed text-white">
                cost ÷ (1 − fee) + shipping
              </p>
              <div className="mt-5 space-y-2.5 text-sm">
                {[
                  ['Manufacturing cost', formatCurrency(400)],
                  ['Amazon commission', '18%'],
                  ['Shipping', formatCurrency(60)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-brand-100">
                    <span>{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-white/20 pt-3 text-white">
                  <span className="font-semibold">Never price below</span>
                  <span className="text-lg font-extrabold">₹547.80</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Static, illustrative snapshot of a report - not live data. */
function HeroPreviewCard() {
  // Same platform colours the real report uses, so the preview matches the product.
  const rows: { id: PlatformId; name: string; fit: number; price: number }[] = [
    { id: 'amazon', name: 'Amazon', fit: 74.8, price: 999 },
    { id: 'flipkart', name: 'Flipkart', fit: 73.3, price: 989 },
    { id: 'snapdeal', name: 'Snapdeal', fit: 71.2, price: 949 },
    { id: 'alibaba', name: 'Alibaba', fit: 64.8, price: 640 },
  ];

  return (
    <div className="card overflow-hidden shadow-lifted">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recommended marketplace
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">Amazon</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ideal price</p>
          <p className="mt-1 text-xl font-extrabold text-profit-600">₹999</p>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        {rows.map((row) => (
          <div key={row.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">{row.name}</span>
              <span className="tabular-nums text-slate-500">
                {formatCurrency(row.price)} · fit {row.fit}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: row.fit + '%', backgroundColor: PLATFORM_COLORS[row.id] }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 border-t border-slate-100 bg-profit-50/60 px-6 py-4">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-profit-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <p className="text-xs leading-relaxed text-profit-700">
          Raise from ₹800 to ₹999 — competitors price higher and demand is strong. Net profit
          ₹359.18 per unit.
        </p>
      </div>
    </div>
  );
}
