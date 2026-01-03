/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f5',
          100: '#ffe4ec',
          200: '#fccfe0',
          300: '#faa7c7',
          400: '#f576a3',
          500: '#f04a8c',
          600: '#dc2872',
          700: '#ba1d5c',
          800: '#9a1b4d',
          900: '#811c44',
        },
        game: {
          bg: '#1F1218',           // Deep Eggplant
          bgSecondary: '#2D1F26', // Dark Berry
          bgTertiary: '#3A2A32',  // Dark Plum
          tile: '#F576A3',         // Raspberry Pink
          tileActive: '#FC9E57',   // Warm Orange
          accent: '#F04A8C',       // Vibrant Pink
          text: '#F2F0F5',         // Soft White
          textMuted: '#B3A6B0',    // Muted Rose Gray
          gold: '#FFD700',         // Luminous Gold
          glow: '#F576A3',         // Raspberry Pink glow
          sparkle: '#FFD700',      // Luminous Gold sparkle
        },
      },
      fontFamily: {
        game: ['SpaceMono', 'monospace'],
      },
    },
  },
  plugins: [],
};
