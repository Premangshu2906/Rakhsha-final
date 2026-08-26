/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f172a',
          indigo: '#1e1b4b',
          blue: '#1d4ed8',
          gold: '#d97706',
          slate: '#334155',
          lightBg: '#f8fafc',
          border: '#e2e8f0'
        },
        risk: {
          high: '#dc2626',      // Red 600
          highBg: '#fef2f2',    // Red 50
          mod: '#d97706',       // Amber 600
          modBg: '#fffbeb',     // Amber 50
          low: '#16a34a',       // Green 600
          lowBg: '#f0fdf4'      // Green 50
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
