import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

/** Shown wherever a list has no rows yet - never a blank screen. */
export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        {icon ?? (
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h10.5" />
          </svg>
        )}
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>

      {action}
    </div>
  );
}
