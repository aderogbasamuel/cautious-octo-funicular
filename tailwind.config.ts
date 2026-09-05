import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0B0E1A",
        panel: "#131A2B",
        raised: "#1B2437",
        line: "#242E45",
        ink: "#F3F1EA",
        muted: "#8B93A8",
        verify: "#E7B44E",
        verifydim: "#3A331E",
        signal: "#4FD1C5",
        signaldim: "#16302E",
        flag: "#E2725B",
        flagdim: "#301E1B",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
export default config;
