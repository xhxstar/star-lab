/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#EFEBE9',
          100: '#D7CCC8',
          200: '#BCAAA4',
          300: '#A1887F',
          400: '#8D6E63',
          500: '#6D4C41',
          600: '#5D4037',
          700: '#4E342E',
          800: '#3E2723',
        },
        piece: {
          black: '#1A1A1A',
          white: '#FAFAFA',
        }
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
