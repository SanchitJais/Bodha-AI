import type { ReactNode } from 'react';

import { cx } from '../../utils/format';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

/** Small pill used for demand, competition, category and status labels. */
export function Badge({ children, className, icon }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        className ?? 'bg-slate-100 text-slate-700 ring-slate-200',
      )}
    >
      {icon}
      {children}
    </span>
  );
}
