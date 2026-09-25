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
        slate: {
          850: '#111827',
          750: '#283548',
          650: '#3f4f66',
          350: '#94a3b8',
          250: '#cbd5e1',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7dd0fc',
          350: '#5ecbfb',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          655: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#032030',
        },
      },
    },
  },
  plugins: [],
}
