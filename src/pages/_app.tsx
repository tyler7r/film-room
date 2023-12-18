import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { type AppType } from "next/app";
import { createContext, useContext, useState } from "react";

import { Navbar } from "~/components/navbar/navbar";
import { IsAuth } from "~/contexts/auth";
import { IsMobile } from "~/contexts/mobile";
import { darkTheme, lightTheme } from "~/contexts/theme";
import "~/styles/globals.css";

export const IsDarkContext = createContext<boolean>(false);

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [affiliation, setAffiliation] = useState<string | null>(null);

  const switchTheme = () => {
    setIsDark(!isDark);
  };

  const updateAffiliation = (team: string) => {
    setAffiliation(team);
  };

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <IsDarkContext.Provider value={isDark}>
        <CssBaseline />
        <IsAuth>
          <IsMobile>
            <Navbar switchTheme={switchTheme} affiliation={affiliation} />
            <Component {...pageProps} updateAffiliation={updateAffiliation} />
          </IsMobile>
        </IsAuth>
      </IsDarkContext.Provider>
    </ThemeProvider>
  );
};

export const useIsDarkContext = () => {
  return useContext(IsDarkContext);
};

export default MyApp;
