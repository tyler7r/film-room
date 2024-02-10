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
  colorBackground: { backgroundColor: string };
  borderStyle: { border: string };
};

export const IsDarkContext = createContext<isDarkContextType>({
  isDark: false,
  setIsDark: () => null,
  backgroundStyle: { backgroundColor: "" },
  colorBackground: { backgroundColor: "" },
  borderStyle: { border: "" },
});

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const backgroundStyle = {
    backgroundColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
  };

  const colorBackground = {
    backgroundColor: `${isDark ? colors.purple[400] : colors.purple.A400}`,
  };

  const borderStyle = {
    border: `${
      isDark
        ? `2px solid ${colors.purple[400]}`
        : `2px solid ${colors.purple.A400}`
    }`,
  };

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <IsDarkContext.Provider
        value={{
          isDark,
          setIsDark,
          backgroundStyle,
          colorBackground,
          borderStyle,
        }}
      >
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
