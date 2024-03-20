import { colors } from "@mui/material";
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  corePlugins: {
    preflight: false,
  },
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: { ...colors },
    },
  },
  plugins: [],
} satisfies Config;
