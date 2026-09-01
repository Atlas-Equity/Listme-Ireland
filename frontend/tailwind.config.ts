import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#398A59", // Requested green
          foreground: "#ffffff",
          hover: "#2e7048" 
        },
        secondary: {
          DEFAULT: "#f9fafb",
          foreground: "#111827",
          hover: "#f3f4f6"
        }
      },
    },
  },
  plugins: [],
};
export default config;
