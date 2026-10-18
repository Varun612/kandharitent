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
          dark: '#2e0854',     // Ultra deep royal purple
          primary: '#4a0e4e',  // Deep royal maroon / purple
          purple: '#581c87',   // Rich royal purple
          accent: '#7c3aed',   // Referenced vibrant accent
          accentLight: '#8b5cf6',
          gold: '#c59a3f',     // Muted elegant royal gold
          goldHover: '#b4852f',
          goldLight: '#fdf3d8',
          cream: '#faf7f2',    // Warm ivory / cream
          creamDark: '#f3ede2',
          surface: '#ffffff'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'royal': '0 10px 30px -5px rgba(74, 14, 78, 0.12), 0 4px 12px -2px rgba(124, 58, 237, 0.08)',
        'royal-lg': '0 20px 40px -10px rgba(74, 14, 78, 0.2), 0 8px 16px -4px rgba(124, 58, 237, 0.12)',
        'gold-glow': '0 0 25px rgba(197, 154, 63, 0.35)'
      }
    },
  },
  plugins: [],
}
