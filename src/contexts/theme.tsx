import { colors, createTheme } from "@mui/material";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#222222",
    },
    primary: {
      main: colors.purple[400],
    },
    secondary: {
      main: colors.yellow.A700,
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: colors.grey[50],
    },
    primary: {
      main: colors.purple.A400,
    },
    secondary: {
      main: colors.yellow.A700,
    },
  },
});
