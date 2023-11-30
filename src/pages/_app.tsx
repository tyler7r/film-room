import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { type AppType } from "next/app";
import { useState } from "react";

import { Navbar } from "~/components/navbar/navbar";
import { IsMobile } from "~/contexts/mobile";
import { darkTheme, lightTheme } from "~/contexts/theme";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isDark, setIsDark] = useState<boolean>(false);

  const switchTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <IsMobile>
        <Navbar switchTheme={switchTheme} isDark={isDark} />
        <Component {...pageProps} />
      </IsMobile>
    </ThemeProvider>
  );
};

export default MyApp;
