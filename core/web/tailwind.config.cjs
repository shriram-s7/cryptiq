module.exports = {
  presets: [require('../../shared/theme/tailwind.preset.cjs')],
  content: { relative: true, files: ['./index.html', './src/**/*.{ts,tsx}'] },
  theme: { extend: {} },
  plugins: [],
};
