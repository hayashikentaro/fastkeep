import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#23211d",
        paper: "#fbfaf6",
        line: "#ded9cb",
        accent: "#2f6f73",
        amber: "#f6d365",
        mint: "#b8e6cf",
        rose: "#f4b6b2",
        sky: "#b7d7f0"
      },
      boxShadow: {
        note: "0 10px 30px rgba(35, 33, 29, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
