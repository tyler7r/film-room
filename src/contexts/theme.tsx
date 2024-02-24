import { colors, createTheme } from "@mui/material";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
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
    primary: {
      main: colors.purple.A400,
    },
    secondary: {
      main: colors.yellow.A700,
    },
  },
});
