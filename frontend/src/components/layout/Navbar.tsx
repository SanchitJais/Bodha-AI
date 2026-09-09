import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { cx } from '../../utils/format';
import { Logo } from './Logo';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/analyze', label: 'Analyze', end: false },
  { to: '/dashboard', label: 'Dashboard', end: false },
];

/** Persistent top navigation, collapsing to a disclosure menu on mobile. */
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    cx(
      'rounded-lg px-3 py-2 text-sm font-semibold transition',
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <nav className="section-shell flex h-16 items-center justify-between" aria-label="Main">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg"
          aria-label="Bodha AI - go to home"
        >
          <Logo className="h-9 w-9" />
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Bodha<span className="text-brand-600"> AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/analyze"
            className="ml-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            New analysis
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {isOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-nav" className="border-t border-slate-200 bg-white sm:hidden">
          <div className="section-shell flex flex-col gap-1 py-3">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
