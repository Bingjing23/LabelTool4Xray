const colors = require("tailwindcss/colors")

module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      // use colors only specified
      white: colors.white,
      gray: colors.gray,
      blue: colors.blue,
    },
    extend: {
      screens: {
        "3xl": "2048px",
        "4xl": "2560px",
        "5xl": "3840px",
      },
    },
  },
  plugins: [],
  important: true,
}
