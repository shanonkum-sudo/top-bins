/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          light: '#2d6a4f',
          DEFAULT: '#1b4332',
          dark: '#081c15',
        },
        scoreboard: {
          bg: '#111827',
          card: '#1f2937',
          accent: '#e5e7eb',
        },
        topbins: '#22c55e',
        redcard: '#ef4444',
        yellowcard: '#eab308',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}