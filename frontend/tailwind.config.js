/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F9FC',
        primary: {
          DEFAULT: '#0B1F3A',
          dark: '#071527',
          light: '#132E54'
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF'
        },
        tealAccent: {
          DEFAULT: '#14B8A6',
          dark: '#0D9488',
          light: '#F0FDFA'
        },
        nhaa: {
          navy: '#0B1F3A',
          blue: '#2563EB',
          teal: '#14B8A6',
          bg: '#F7F9FC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B'
        },
        status: {
          success: '#16A34A',
          successBg: '#F0FDF4',
          warning: '#F59E0B',
          warningBg: '#FFFBEB',
          critical: '#DC2626',
          criticalBg: '#FEF2F2'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        'soft-md': '0 4px 12px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)',
        'soft-lg': '0 10px 25px -3px rgba(15, 23, 42, 0.06), 0 4px 10px -2px rgba(15, 23, 42, 0.03)',
        'soft-xl': '0 20px 35px -5px rgba(15, 23, 42, 0.08), 0 8px 16px -4px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 14px 28px rgba(15, 23, 42, 0.09), 0 6px 12px rgba(15, 23, 42, 0.04)'
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px'
      }
    },
  },
  plugins: [],
}
