import { useEffect, useState } from 'react';

const STEPS = [
  'Reading your product economics…',
  'Pulling comparable listings per marketplace…',
  'Computing break-even floors and profit…',
  'Ranking marketplaces and writing your listing…',
];

const STEP_INTERVAL_MS = 700;

/** Full-screen loading state shown while an analysis is in flight. */
export function AnalyzingSkeleton() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="section-shell py-10 sm:py-14" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <svg
          className="h-5 w-5 animate-spin text-brand-600"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
          />
        </svg>
        <div>
          <h1 className="text-title font-bold text-slate-900">Analysing your product</h1>
          <p className="text-sm text-slate-600">{STEPS[stepIndex]}</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="skeleton h-36 rounded-2xl" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeleton h-56 rounded-2xl" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>

      <span className="sr-only">Analysis in progress, please wait.</span>
    </div>
  );
}
