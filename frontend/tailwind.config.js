/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          // Telegram theme colors
          tg: {
            'bg': 'var(--tg-bg-color, #ffffff)',
            'text': 'var(--tg-text-color, #000000)',
            'hint': 'var(--tg-hint-color, #999999)',
            'link': 'var(--tg-link-color, #007AFF)',
            'button': 'var(--tg-button-color, #007AFF)',
            'button-text': 'var(--tg-button-text-color, #ffffff)',
            'secondary-bg': 'var(--tg-secondary-bg-color, #f1f1f1)',
          },
          // Custom app colors
          primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16',
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
            950: '#431407',
          },
          error: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a',
          },
        },
        fontFamily: {
          sans: [
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'sans-serif',
          ],
        },
        fontSize: {
          'xs': ['0.75rem', { lineHeight: '1rem' }],
          'sm': ['0.875rem', { lineHeight: '1.25rem' }],
          'base': ['1rem', { lineHeight: '1.5rem' }],
          'lg': ['1.125rem', { lineHeight: '1.75rem' }],
          'xl': ['1.25rem', { lineHeight: '1.75rem' }],
          '2xl': ['1.5rem', { lineHeight: '2rem' }],
          '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
          '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
          '128': '32rem',
        },
        borderRadius: {
          'xl': '0.75rem',
          '2xl': '1rem',
          '3xl': '1.5rem',
        },
        boxShadow: {
          'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
          'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        animation: {
          'spin-slow': 'spin 2s linear infinite',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'bounce-subtle': 'bounce-subtle 2s infinite',
          'fade-in': 'fade-in 0.5s ease-out',
          'slide-up': 'slide-up 0.3s ease-out',
          'scale-in': 'scale-in 0.2s ease-out',
        },
        keyframes: {
          'bounce-subtle': {
            '0%, 100%': {
              transform: 'translateY(-2%)',
              animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
            },
            '50%': {
              transform: 'none',
              animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
            },
          },
          'fade-in': {
            '0%': {
              opacity: '0',
            },
            '100%': {
              opacity: '1',
            },
          },
          'slide-up': {
            '0%': {
              transform: 'translateY(10px)',
              opacity: '0',
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: '1',
            },
          },
          'scale-in': {
            '0%': {
              transform: 'scale(0.95)',
              opacity: '0',
            },
            '100%': {
              transform: 'scale(1)',
              opacity: '1',
            },
          },
        },
        backdropBlur: {
          'xs': '2px',
        },
        screens: {
          'xs': '475px',
        },
      },
    },
    plugins: [
      // Custom plugin for Telegram theme variables
      function({ addBase, theme }) {
        addBase({
          ':root': {
            '--tg-bg-color': '#ffffff',
            '--tg-text-color': '#000000',
            '--tg-hint-color': '#999999',
            '--tg-link-color': '#007AFF',
            '--tg-button-color': '#007AFF',
            '--tg-button-text-color': '#ffffff',
            '--tg-secondary-bg-color': '#f1f1f1',
          },
          '.dark': {
            '--tg-bg-color': '#1C1C1E',
            '--tg-text-color': '#ffffff',
            '--tg-hint-color': '#8E8E93',
            '--tg-link-color': '#007AFF',
            '--tg-button-color': '#007AFF',
            '--tg-button-text-color': '#ffffff',
            '--tg-secondary-bg-color': '#2C2C2E',
          },
        });
      },
      // Custom plugin for biometric status colors
      function({ addUtilities }) {
        const newUtilities = {
          '.biometric-success': {
            '@apply bg-success-50 border-success-200 text-success-800 dark:bg-success-900/20 dark:border-success-700/50 dark:text-success-300': {},
          },
          '.biometric-warning': {
            '@apply bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-700/50 dark:text-warning-300': {},
          },
          '.biometric-error': {
            '@apply bg-error-50 border-error-200 text-error-800 dark:bg-error-900/20 dark:border-error-700/50 dark:text-error-300': {},
          },
          '.glass': {
            '@apply backdrop-blur-md bg-white/80 dark:bg-black/80 border border-white/20 dark:border-white/10': {},
          },
          '.glass-strong': {
            '@apply backdrop-blur-xl bg-white/90 dark:bg-black/90 border border-white/30 dark:border-white/20': {},
          },
        };
        addUtilities(newUtilities);
      },
    ],
  }