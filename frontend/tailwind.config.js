/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        card: '#1a254b',
        accent: '#3b82f6',
        accentRed: '#ef4444',
        accentGreen: '#10b981',
        accentBlue: '#06b6d4',
        accentPurple: '#8b5cf6',
        accentOrange: '#f97316',
      },
      boxShadow: {
        panel: '0 10px 50px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
