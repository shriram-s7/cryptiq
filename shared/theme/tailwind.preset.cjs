// CryptIQ Tailwind preset — usage: presets: [require('../shared/theme/tailwind.preset.cjs')]
// Values mirror shared/theme/tokens.css (docs/SHARED_THEME_AND_CONTRACT.md §2).
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: { 700: '#16404F', 900: '#0B2530' },
        emerald: { 50: '#E7F7F0', 600: '#059669' },
        danger: { 600: '#DC2626' },
        warn: { 600: '#D97706' },
        terminal: { bg: '#0B1220', fg: '#D1FAE5' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '10px',
      },
    },
  },
};
