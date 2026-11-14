/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['*.html'],
  theme: {
    extend: {
      colors: {},
      keyframes: {
        fade: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        spin: { to: { transform: 'rotate(360deg)' } }
      },
      animation: {
        fade: 'fade .25s ease',
        spin: 'spin .8s linear infinite'
      }
    }
  },
  plugins: [],
}
