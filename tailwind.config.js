/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./**/*.{js,jsx,ts,tsx}",
  "!./node_modules/**/*",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

