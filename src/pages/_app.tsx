import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider, colors } from "@mui/material";

import { type AppType } from "next/app";
import { createContext, useContext, useState } from "react";

import { Navbar } from "~/components/navbar/navbar";
import { IsAffiliated } from "~/contexts/affiliations";
import { IsAuth } from "~/contexts/auth";
import { IsMobile } from "~/contexts/mobile";
import { darkTheme, lightTheme } from "~/contexts/theme";
import "~/styles/globals.css";

type isDarkContextType = {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  backgroundStyle: { backgroundColor: string };
};

export const IsDarkContext = createContext<isDarkContextType>({
  isDark: false,
  setIsDark: () => null,
  backgroundStyle: { backgroundColor: "" },
});

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const backgroundStyle = {
    backgroundColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
  };

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <IsDarkContext.Provider value={{ isDark, setIsDark, backgroundStyle }}>
        <CssBaseline />
        <IsAuth>
          <IsMobile>
            <IsAffiliated>
              <Navbar />
              <Component {...pageProps} />
            </IsAffiliated>
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
