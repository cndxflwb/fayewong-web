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
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
        },
        bg: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          dark: 'rgb(var(--color-bg-dark) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        accent: {
          teal: 'rgb(var(--color-accent-teal) / <alpha-value>)',
          red: 'rgb(var(--color-accent-red) / <alpha-value>)',
          yellow: 'rgb(var(--color-accent-yellow) / <alpha-value>)',
          mint: 'rgb(var(--color-accent-mint) / <alpha-value>)',
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
