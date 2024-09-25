/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
      './exams/*.html',
    'node_modules/preline/dist/*.js',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
      require('@tailwindcss/forms'),
      require('preline/plugin'),
  ],
  variants: {
    extend: {
      display: ['dark'],
    },
  },
}

