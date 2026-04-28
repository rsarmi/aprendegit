import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#0b1020",
          soft: "#11172a",
          card: "#151c33",
        },
        ink: {
          DEFAULT: "#e6ecff",
          soft: "#a6b1d4",
          dim: "#6b7699",
        },
        accent: {
          DEFAULT: "#7c5cff",
          soft: "#a48cff",
          ink: "#ffffff",
        },
        success: { DEFAULT: "#3ddc97" },
        warn: { DEFAULT: "#ffb454" },
        danger: { DEFAULT: "#ff6b6b" },
        branch: {
          main: "#7c5cff",
          feature: "#3ddc97",
        },
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(124, 92, 255, 0.5)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124,92,255,0.5)" },
          "50%": { boxShadow: "0 0 0 12px rgba(124,92,255,0)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
