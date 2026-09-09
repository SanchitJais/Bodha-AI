import { useEffect, useState } from 'react';

import { useToast } from '../../hooks/useToast';
import { cx } from '../../utils/format';

interface CopyButtonProps {
  value: string;
  label: string;
  className?: string;
}

/** Copies `value` to the clipboard and confirms inline plus via a toast. */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast(label + ' copied to clipboard', 'success');
    } catch {
      showToast('Could not access the clipboard. Copy manually instead.', 'error');
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={'Copy ' + label.toLowerCase()}
      className={cx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
        copied
          ? 'bg-profit-50 text-profit-700'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
        className,
      )}
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {copied ? (
          <path d="M4.5 12.75l6 6 9-13.5" />
        ) : (
          <>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
