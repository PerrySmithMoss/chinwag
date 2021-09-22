const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "dark-background": "#1b1b23",
        "dark-background-accent": "#2b2b37",
        "light-background": "#ffffff",
        "light-background-accent": "#f3f3fd",
        "white-text": "#e9eaeb",
        "tan-background": "#fbb3a3",
        "tan-background-accent": "#ff725e",
        "tan-text": "#ff725e",
        "blue-text": "#2b68b0",
      },
      fontFamily: {
        sans: ['Nunito', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
