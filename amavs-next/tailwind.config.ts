import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Charcoal dark palette (replaces navy)
        navy: {
          DEFAULT: '#111111',
          50:  '#2C2C2C',
          100: '#1A1A1A',
          200: '#111111',
          300: '#0A0A0A',
          400: '#050505',
          500: '#000000',
        },
        // Gold stays the same
        gold: {
          DEFAULT: '#D4AF37',
          50:  '#f5e99a',
          100: '#f0df6e',
          200: '#e8ce4a',
          300: '#D4AF37',
          400: '#b8962e',
          500: '#9c7d25',
          600: '#7d641e',
        },
        wine: {
          DEFAULT: '#BB1E1E',
          50:  '#f08080',
          100: '#e05555',
          200: '#cc2e2e',
          300: '#BB1E1E',
          400: '#9e1919',
          500: '#811414',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'grid-dark':           `linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)`,
        'grid-light':          `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
        'gradient-gold':       'linear-gradient(135deg, #D4AF37 0%, #f5e99a 50%, #D4AF37 100%)',
        'gradient-radial-gold':'radial-gradient(ellipse at center, rgba(212,175,55,0.12) 0%, transparent 70%)',
      },
      boxShadow: {
        'glass':      '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glass-gold': '0 8px 32px 0 rgba(212, 175, 55, 0.15)',
        'glow-gold':  '0 0 20px rgba(212, 175, 55, 0.35)',
        'glow-wine':  '0 0 20px rgba(187, 30, 30, 0.4)',
        'card':       '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'pulse-gold':  'pulseGold 2s ease-in-out infinite',
        'ping-slow':   'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'fade-up':     'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%':      { boxShadow: '0 0 0 15px rgba(212, 175, 55, 0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

export default config
