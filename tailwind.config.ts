/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C9A96E',
          dark: '#8B6914',
          light: '#E8D5A3',
        },
        bg: {
          DEFAULT: '#1A1A2E',
          secondary: '#16213E',
          dark: '#0F0F1A',
        },
        text: {
          DEFAULT: '#F5F5F5',
          secondary: '#B8B8CC',
          muted: '#8888AA',
        },
        accent: {
          teal: '#4ECDC4',
          red: '#FF6B6B',
          yellow: '#FFE66D',
          mint: '#95E1D3',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'Noto Sans', 'sans-serif'],
        serif: ['Noto Serif SC', 'Noto Serif', 'serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
