/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#0A0A0F',
        card:         '#0F0F1A',
        'card-2':     '#13132A',
        primary:      '#7C3AED',
        'primary-l':  '#A78BFA',
        neon:         '#B026FF',
        cyan:         '#00F5FF',
        'cyan-d':     '#00B4D8',
        pink:         '#F43F5E',
        success:      '#00FF88',
        danger:       '#FF3366',
        muted:        '#64748B',
      },
      fontFamily: {
        display: ['Russo One', 'sans-serif'],
        body:    ['Chakra Petch', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
