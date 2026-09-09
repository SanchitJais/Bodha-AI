import { useNavigate } from 'react-router-dom';

import { ImageUpload } from '../components/analyze/ImageUpload';
import { PlatformChips } from '../components/analyze/PlatformChips';
import { AnalyzingSkeleton } from '../components/report/AnalyzingSkeleton';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { useAnalyzeForm } from '../hooks/useAnalyzeForm';
import { useAnalyzeProduct, useMeta } from '../hooks/useProducts';
import { useToast } from '../hooks/useToast';
import { ApiError } from '../services/api';
import type { CategoryId } from '../types';
import { cx } from '../utils/format';

export function AnalyzePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { values, errors, setValue, togglePlatform, submit } = useAnalyzeForm();
  const { data: meta, isLoading: isMetaLoading, isError: isMetaError } = useMeta();
  const analyzeMutation = useAnalyzeProduct();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = submit();
    if (!payload) {
      showToast('Please fix the highlighted fields before analysing.', 'error');
      return;
    }

    analyzeMutation.mutate(payload, {
      onSuccess: (analysis) => {
        showToast('Analysis complete', 'success');
        navigate('/report/' + analysis.productId);
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Something went wrong while analysing your product.';
        showToast(message, 'error');
      },
    });
  }

  if (analyzeMutation.isPending) {
    return <AnalyzingSkeleton />;
  }

  return (
    <div className="section-shell py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Step 1 of 2</p>
        <h1 className="mt-2 text-headline font-extrabold tracking-tight text-slate-900">
          Tell us about your product
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Bodha AI compares it against similar listings on each marketplace you select, then
          recommends where to sell and what to charge.
        </p>
      </header>

      {isMetaError && (
        <div
          role="alert"
          className="mt-8 rounded-xl border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700"
        >
          Could not load categories and marketplaces. Check that the backend is running on port
          4000, then reload this page.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        {/* ------------------------------------------------ Product details */}
        <section className="card space-y-5 p-6 sm:p-7">
          <h2 className="text-title font-bold text-slate-900">Product details</h2>

          <ImageUpload value={values.imageUrl} onChange={(url) => setValue('imageUrl', url)} />

          <FormField id="title" label="Product title" error={errors.title}>
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                type="text"
                value={values.title}
                onChange={(event) => setValue('title', event.target.value)}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                placeholder="e.g. USB C Fast Charging Cable"
                className={cx('field', invalid && 'field-invalid')}
              />
            )}
          </FormField>

          <FormField
            id="description"
            label="Product description"
            hint="What it is, what it is made of, and who it is for."
            error={errors.description}
          >
            {({ id, describedBy, invalid }) => (
              <textarea
                id={id}
                rows={5}
                value={values.description}
                onChange={(event) => setValue('description', event.target.value)}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                placeholder="e.g. Nylon braided 1.5m cable supporting 65W fast charge and data sync."
                className={cx('field resize-y', invalid && 'field-invalid')}
              />
            )}
          </FormField>

          <FormField id="category" label="Category" error={errors.category}>
            {({ id, describedBy, invalid }) => (
              <select
                id={id}
                value={values.category}
                onChange={(event) => setValue('category', event.target.value as CategoryId)}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                disabled={isMetaLoading}
                className={cx('field', invalid && 'field-invalid')}
              >
                <option value="">
                  {isMetaLoading ? 'Loading categories…' : 'Select a category'}
                </option>
                {meta?.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        </section>

        {/* --------------------------------------- Economics + marketplaces */}
        <div className="space-y-6">
          <section className="card space-y-5 p-6 sm:p-7">
            <div>
              <h2 className="text-title font-bold text-slate-900">Your economics</h2>
              <p className="mt-1 text-sm text-slate-600">
                These two numbers set the break-even floor we will never price below.
              </p>
            </div>

            <FormField
              id="manufacturingCost"
              label="Manufacturing cost per unit"
              error={errors.manufacturingCost}
            >
              {({ id, describedBy, invalid }) => (
                <div className="relative">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-slate-500"
                    aria-hidden="true"
                  >
                    ₹
                  </span>
                  <input
                    id={id}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={values.manufacturingCost}
                    onChange={(event) => setValue('manufacturingCost', event.target.value)}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    placeholder="400"
                    className={cx('field pl-8', invalid && 'field-invalid')}
                  />
                </div>
              )}
            </FormField>

            <FormField id="currentPrice" label="Current selling price" error={errors.currentPrice}>
              {({ id, describedBy, invalid }) => (
                <div className="relative">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-slate-500"
                    aria-hidden="true"
                  >
                    ₹
                  </span>
                  <input
                    id={id}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={values.currentPrice}
                    onChange={(event) => setValue('currentPrice', event.target.value)}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    placeholder="800"
                    className={cx('field pl-8', invalid && 'field-invalid')}
                  />
                </div>
              )}
            </FormField>
          </section>

          <section className="card p-6 sm:p-7">
            <PlatformChips
              platforms={meta?.platforms ?? []}
              selected={values.platforms}
              onToggle={togglePlatform}
              error={errors.platforms}
            />

            {isMetaLoading && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="skeleton h-[74px]" />
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <p className="text-xs text-slate-500 sm:mr-auto">
              Nothing is sent to a marketplace — this is a local analysis.
            </p>
            <Button type="submit" size="lg" loading={analyzeMutation.isPending}>
              Analyze
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
