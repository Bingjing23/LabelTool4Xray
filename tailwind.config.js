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
        "3xl": "1792px",
        "4xl": "2048px",
        "5xl": "2816px",
        "6xl": "3328px",
        "7xl": "4352px",
      },
    },
  },
  plugins: [],
  important: true,
}
