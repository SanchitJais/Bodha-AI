/**
 * Bodha AI design tokens.
 *
 * Palette intent: deep indigo carries the brand and all primary actions;
 * emerald always and only means "money you keep"; amber/rose always and only
 * mean "loss risk". Keeping those three semantic colours reserved is what makes
 * the report scannable at a glance.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        profit: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        risk: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Consistent type scale used across every screen.
        'display': ['3.25rem', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
        'headline': ['2.125rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'title': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'ambient': ['0.8125rem', { lineHeight: '1.5' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.14)',
        lifted: '0 2px 4px rgba(15, 23, 42, 0.04), 0 18px 40px -16px rgba(49, 46, 129, 0.28)',
        glow: '0 0 0 1px rgba(79, 70, 229, 0.12), 0 20px 44px -20px rgba(79, 70, 229, 0.45)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'slide-in': 'slide-in 0.25s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
