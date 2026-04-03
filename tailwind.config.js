/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        courier: ['"Courier Prime"', '"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        club: {
          bg: '#080808',
          text: '#f0ebe0',
          gold: '#c9963a',
          'gold-bright': '#f5c842',
          red: '#dc2626',
          'red-hot': '#ef4444',
          card: '#111111',
        },
      },
      animation: {
        'blink-slow': 'blink 2s step-end infinite',
        'waveform': 'waveform 0.5s ease-in-out infinite alternate',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        waveform: {
          '0%': { height: '4px' },
          '100%': { height: '32px' },
        },
      },
    },
  },
  plugins: [],
};
