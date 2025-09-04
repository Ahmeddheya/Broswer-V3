/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#4285f4',
          600: '#3367d6',
          700: '#1976d2',
          900: '#0d47a1',
        },
        secondary: {
          50: '#fff3e0',
          100: '#ffe0b2',
          500: '#ff9800',
          600: '#f57c00',
          700: '#ef6c00',
          900: '#e65100',
        },
        success: {
          50: '#e8f5e8',
          500: '#4caf50',
          700: '#388e3c',
        },
        error: {
          50: '#ffebee',
          500: '#ff6b6b',
          700: '#d32f2f',
        },
        background: {
          primary: '#0a0b1e',
          secondary: '#1a1b3a',
          tertiary: '#2a2b4a',
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.8)',
          tertiary: 'rgba(255, 255, 255, 0.6)',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}