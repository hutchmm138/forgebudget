/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f1e2e',
          2: '#162840',
          3: '#1e3a52',
          4: '#2d4a63',
        },
        forge: {
          orange: '#ea580c',
          'orange-lt': '#fb923c',
          'orange-bg': '#fff7ed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
