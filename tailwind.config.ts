import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "#f8f7f4",
        ink: "#252525",
        mist: "#ebe7df",
        sage: "#dfe7dd",
        clay: "#d9bca7",
        graphite: "#3d4142"
      },
      boxShadow: {
        journal: "0 22px 60px rgba(55, 52, 48, 0.12)",
        soft: "0 12px 34px rgba(55, 52, 48, 0.10)"
      },
      borderRadius: {
        app: "28px"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
