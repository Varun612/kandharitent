/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1A0512',      // Deep royal obsidian plum
          twilight: '#0F0218',  // Twilight sky deep violet-black
          primary: '#4A0E2E',   // Imperial royal burgundy
          plum: '#3D0C27',      // Rich velvet plum
          purple: '#4A0E2E',    // Compatibility mapping to rich plum
          accent: '#8C1D40',    // Regal deep carmine accent
          accentLight: '#A8284F',
          gold: '#C5A059',      // Restrained antique champagne gold
          goldHover: '#B08A42',
          goldLight: '#F5E6CA',
          champagne: '#DFBE7C',
          cream: '#FAF7F2',     // Sophisticated warm ivory canvas
          creamDark: '#F3EDE2',
          surface: '#FFFFFF',
          card: '#FDFBF7',
          border: '#EBE3D5'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'royal': '0 10px 30px -5px rgba(42, 8, 27, 0.15), 0 4px 12px -2px rgba(197, 160, 89, 0.1)',
        'royal-lg': '0 20px 45px -10px rgba(42, 8, 27, 0.28), 0 8px 20px -4px rgba(197, 160, 89, 0.15)',
        'gold-subtle': '0 0 20px rgba(197, 160, 89, 0.25)',
        'gold-glow': '0 0 35px rgba(223, 190, 124, 0.35)',
        'luxury': '0 15px 35px -5px rgba(26, 5, 18, 0.2), 0 0 0 1px rgba(197, 160, 89, 0.15)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }
    },
  },
  plugins: [],
}
