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
        graphite: {
          950: '#0B0E12',
          900: '#101419', // Main workstation background
          850: '#161B22',
          800: '#1B222A', // Panel / card surface
          700: '#242D37', // Hover / elevated surface
          600: '#303B45', // Structural border
          500: '#465360',
          400: '#7B8A97',
          300: '#A7B3BC', // Secondary text
          200: '#C9D4DC',
          100: '#E8EEF2', // Primary text
          50: '#F5F8FA',
        },
        lime: {
          accent: '#B8E986', // Signal-lime accent
          bright: '#C6F299',
          dim: '#8FBA66',
          muted: 'rgba(184, 233, 134, 0.12)',
        },
        status: {
          error: '#FF6B6B',
          warning: '#FFC043',
          info: '#62C2FE',
          success: '#5EEA76',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        panel: '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        glow: '0 0 15px -3px rgba(184, 233, 134, 0.25)',
      }
    },
  },
  plugins: [],
}
