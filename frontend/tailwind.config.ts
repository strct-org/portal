import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        syno: {
          orange: "#E08E00",
          hoverOrange: "#B87500",
          dark: "#1D1D1F",
          medium: "#444446",
          light: "#F5F5F7",
          border: "#D2D2D7",
        },
      },
    },
  },
  plugins: [],
};
export default config;
