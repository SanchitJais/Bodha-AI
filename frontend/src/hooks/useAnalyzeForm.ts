/**
 * Form state and validation for the analyze screen.
 *
 * Validation rules deliberately mirror `backend/src/utils/validation.ts` so the
 * seller sees the same wording whichever side rejects the input.
 */

import { useCallback, useState } from 'react';

import type { AnalyzeRequest, CategoryId, PlatformId } from '../types';

export interface AnalyzeFormValues {
  title: string;
  description: string;
  category: CategoryId | '';
  manufacturingCost: string;
  currentPrice: string;
  platforms: PlatformId[];
  imageUrl: string | null;
}

export type AnalyzeFormErrors = Partial<Record<keyof AnalyzeFormValues, string>>;

export const INITIAL_VALUES: AnalyzeFormValues = {
  title: '',
  description: '',
  category: '',
  manufacturingCost: '',
  currentPrice: '',
  platforms: ['amazon', 'flipkart', 'snapdeal', 'alibaba'],
  imageUrl: null,
};

/** Parse a money field, returning NaN for anything non-numeric. */
function parseMoney(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

export function validate(values: AnalyzeFormValues): AnalyzeFormErrors {
  const errors: AnalyzeFormErrors = {};

  if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }
  if (values.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }
  if (!values.category) {
    errors.category = 'Choose a category';
  }

  const cost = parseMoney(values.manufacturingCost);
  const price = parseMoney(values.currentPrice);

  if (Number.isNaN(cost)) {
    errors.manufacturingCost = 'Enter your manufacturing cost';
  } else if (cost <= 0) {
    errors.manufacturingCost = 'Manufacturing cost must be greater than 0';
  }

  if (Number.isNaN(price)) {
    errors.currentPrice = 'Enter your current selling price';
  } else if (price <= 0) {
    errors.currentPrice = 'Current selling price must be greater than 0';
  }

  // Only compare once both numbers are individually valid.
  if (!errors.manufacturingCost && !errors.currentPrice && cost >= price) {
    errors.manufacturingCost = 'Manufacturing cost must be lower than the current selling price';
  }

  if (values.platforms.length === 0) {
    errors.platforms = 'Select at least one marketplace';
  }

  return errors;
}

export function useAnalyzeForm() {
  const [values, setValues] = useState<AnalyzeFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<AnalyzeFormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /** Update one field, clearing its error once the seller starts fixing it. */
  const setValue = useCallback(
    <K extends keyof AnalyzeFormValues>(key: K, value: AnalyzeFormValues[K]) => {
      setValues((current) => {
        const next = { ...current, [key]: value };
        // After a failed submit, re-validate live so errors clear as they type.
        if (hasSubmitted) setErrors(validate(next));
        return next;
      });
    },
    [hasSubmitted],
  );

  const togglePlatform = useCallback(
    (platform: PlatformId) => {
      setValues((current) => {
        const platforms = current.platforms.includes(platform)
          ? current.platforms.filter((id) => id !== platform)
          : [...current.platforms, platform];

        const next = { ...current, platforms };
        if (hasSubmitted) setErrors(validate(next));
        return next;
      });
    },
    [hasSubmitted],
  );

  /** Validate everything; returns the API payload when the form is valid. */
  const submit = useCallback((): AnalyzeRequest | null => {
    setHasSubmitted(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return null;

    return {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category as CategoryId,
      imageUrl: values.imageUrl,
      manufacturingCost: Number(values.manufacturingCost),
      currentPrice: Number(values.currentPrice),
      platforms: values.platforms,
    };
  }, [values]);

  const reset = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setHasSubmitted(false);
  }, []);

  return { values, errors, setValue, togglePlatform, submit, reset };
}
