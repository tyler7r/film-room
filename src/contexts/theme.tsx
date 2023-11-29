import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
  // components: {
  //   MuiButton: {
  //     styleOverrides: {
  //       root: ({ ownerState }) => ({
  //         ...(ownerState.variant === "contained" && {
  //           backgroundColor: "#fff",
  //           color: colors.amber[500],
  //         }),
  //       }),
  //     },
  //   },
  // },
  palette: {
    mode: "dark",
    primary: {
      main: "#3f51b5",
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1F6FFF",
    },
  },
});
