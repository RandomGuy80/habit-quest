/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F172A',
        card: '#1E293B',
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        streak: '#FBBF24',
        success: '#22C55E',
        danger: '#EF4444',
        muted: '#94A3B8',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['Bangers', 'cursive'],
        body: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        comic: '4px 4px 0px',
        'comic-sm': '2px 2px 0px',
        'comic-lg': '6px 6px 0px',
      },
    },
  },
  plugins: [],
};
