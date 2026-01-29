/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0D10',
        surface: '#11151C',
        primary: '#4FD1FF',
        secondary: '#8B5CF6',
        textPrimary: '#F5F7FA',
        textMuted: '#9CA3AF',
        border: 'rgba(255,255,255,0.06)',
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0, 0, 0, 0.4)',
        'soft-hover': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

