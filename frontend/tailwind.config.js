/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        dark: {
          bg: '#020617',
          surface: '#0F172A',
          'surface-secondary': '#111827',
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#F8FAFC',
          'text-secondary': '#94A3B8',
        },
        accent: {
          cyan: '#06b6d4',
          violet: '#7c3aed',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#ef4444',
          pink: '#ec4899',
        },
        campus: {
          indigo: '#312e81',
          royal: '#4f46e5',
          blue: '#2563eb',
          cyan: '#06b6d4',
          violet: '#7c3aed',
          emerald: '#10b981',
          pink: '#ec4899',
          amber: '#f59e0b',
          red: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 35px -5px rgba(79, 70, 229, 0.45)',
        'glow-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.45)',
        'glow-violet': '0 0 35px -5px rgba(124, 58, 237, 0.45)',
        'glow-emerald': '0 0 35px -5px rgba(16, 185, 129, 0.45)',
        'glow-amber': '0 0 35px -5px rgba(245, 158, 11, 0.45)',
        'glow-rose': '0 0 35px -5px rgba(239, 68, 68, 0.45)',
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'premium-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 8px 12px -4px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #020617 0%, #0f172a 35%, #1e1b4b 70%, #312e81 100%)',
        'gradient-brand': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
        'gradient-premium': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #2563eb 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-dark-hero': 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
        'mesh-pattern': 'radial-gradient(at 40% 20%, rgba(79, 70, 229, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(124, 58, 237, 0.15) 0px, transparent 50%)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4.5s ease-in-out infinite',
        'float-reverse': 'floatReverse 5.5s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(12px) rotate(-2deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.08)' },
        }
      }
    },
  },
  plugins: [],
}
