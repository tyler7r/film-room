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
import { TheInbox } from "~/contexts/inbox";
import { IsMobile } from "~/contexts/mobile";
import { GlobalSearch } from "~/contexts/search";
import { darkTheme, lightTheme } from "~/contexts/theme";
import "~/styles/globals.css";

type isDarkContextType = {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  backgroundStyle: { backgroundColor: string };
  colorBackground: { backgroundColor: string };
  borderStyle: { border: string };
  hoverBorder: string;
  hoverText: string;
};

export const IsDarkContext = createContext<isDarkContextType>({
  isDark: false,
  setIsDark: () => null,
  backgroundStyle: { backgroundColor: "" },
  colorBackground: { backgroundColor: "" },
  borderStyle: { border: "" },
  hoverBorder: "",
  hoverText: "",
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

  const hoverBorder = `cursor-pointer rounded-sm border-2 border-solid border-transparent p-1 px-2 transition ease-in-out hover:rounded-md hover:border-solid ${
    isDark ? "hover:border-purple-400" : "hover:border-purple-A400"
  } hover:delay-100`;

  const hoverText = `cursor-pointer ${
    isDark ? "hover:text-purple-400" : "hover:text-purple-A400"
  } hover:delay-100`;

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <IsDarkContext.Provider
        value={{
          isDark,
          setIsDark,
          backgroundStyle,
          colorBackground,
          borderStyle,
          hoverBorder,
          hoverText,
        }}
      >
        <CssBaseline />
        <IsAuth>
          <IsMobile>
            <IsAffiliated>
              <TheInbox>
                <GlobalSearch>
                  <Navbar />
                  <Component {...pageProps} />
                </GlobalSearch>
              </TheInbox>
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
