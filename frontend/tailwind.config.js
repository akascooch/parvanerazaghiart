/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--background)",
        ink: "var(--foreground)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        paper: "#f7f4ef",
        parchment: "#ebe4d8",
        noir: "#121110",
        charcoal: "#1c1b18",
        gold: {
          DEFAULT: "#9e814d",
          light: "#cbb387",
          dark: "#735c34",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Georgia", "Times New Roman", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxury: "0.28em",
        editorial: "0.18em",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "ambient-float": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.04)" },
          "50%": { transform: "translate3d(0, -1.6%, 0) scale(1.07)" },
        },
        "light-sweep": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        "ambient-float": "ambient-float 32s ease-in-out infinite",
        "light-sweep": "light-sweep 10s cubic-bezier(0.16, 1, 0.3, 1) infinite",
      },
    },
  },
  plugins: [],
};
