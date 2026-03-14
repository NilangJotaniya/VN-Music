/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // VN Brand Colors
        vn: {
          bg:       '#0a0a0f',   // Near black background
          surface:  '#111118',   // Card/panel surfaces
          elevated: '#1a1a24',   // Elevated surfaces (modals, dropdowns)
          border:   '#2a2a3a',   // Subtle borders
          accent:   '#7c3aed',   // Purple accent (primary)
          'accent-light': '#a855f7',
          'accent-glow':  '#7c3aed33',
          text:     '#e8e8f0',   // Primary text
          muted:    '#8888aa',   // Secondary/muted text
          player:   '#0d0d15',   // Player bar background
        },
      },
      fontFamily: {
        sans: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow':   'spin 3s linear infinite',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px #7c3aed44' },
          '100%': { boxShadow: '0 0 20px #7c3aed88, 0 0 40px #7c3aed33' },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
