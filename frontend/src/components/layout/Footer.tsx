import { Link } from 'react-router-dom';

import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="section-shell flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Bodha<span className="text-brand-600"> AI</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Marketplace, pricing and listing guidance for e-commerce sellers - with a hard floor
            that never recommends a loss-making price.
          </p>
        </div>

        <nav aria-label="Footer" className="flex gap-12">
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Product</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/" className="rounded transition hover:text-brand-700">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="rounded transition hover:text-brand-700">
                  Analyze
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="rounded transition hover:text-brand-700">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Marketplaces
            </h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Amazon</li>
              <li>Flipkart</li>
              <li>Snapdeal</li>
              <li>Alibaba</li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="border-t border-slate-100">
        <div className="section-shell flex flex-col gap-1.5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bodha AI. Demo build.</p>
          <p>Market data is mocked for demonstration - no live marketplace APIs are called.</p>
        </div>
      </div>
    </footer>
  );
}
