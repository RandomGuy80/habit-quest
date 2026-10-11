/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07090F',
        card: '#0D1117',
        'card-2': '#111827',
        primary: '#818CF8',
        'primary-dark': '#6366F1',
        accent: '#22D3EE',
        'accent-dark': '#0891B2',
        success: '#10B981',
        danger: '#EF4444',
        muted: '#64748B',
        border: 'rgba(255,255,255,0.06)',
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
