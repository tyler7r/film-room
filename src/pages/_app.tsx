// import "@fontsource/lexend/300.css";
// import "@fontsource/lexend/400.css";
// import "@fontsource/lexend/500.css";
// import "@fontsource/lexend/700.css";
// import "@fontsource/lexend/800.css";
// import "@fontsource/lexend/900.css";
import "@fontsource/outfit/300.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/700.css";
import "@fontsource/outfit/800.css";
import "@fontsource/outfit/900.css";

import { CssBaseline, ThemeProvider, colors } from "@mui/material";

import { type AppType } from "next/app";
import Head from "next/head";
import { createContext, useContext, useState } from "react";

import { Navbar } from "~/components/navbar";
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
  colorText: string;
  backgroundStyleString: string;
};

export const IsDarkContext = createContext<isDarkContextType>({
  isDark: false,
  setIsDark: () => null,
  backgroundStyle: { backgroundColor: "" },
  colorBackground: { backgroundColor: "" },
  borderStyle: { border: "" },
  hoverBorder: "",
  hoverText: "",
  colorText: "",
  backgroundStyleString: "",
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

  const backgroundStyleString = `${
    isDark ? colors.grey[900] : colors.grey[100]
  }`;

  const hoverBorder = `cursor-pointer rounded-sm border-2 border-solid border-transparent p-1 px-2 transition ease-in-out hover:rounded-md hover:border-solid ${
    isDark ? "hover:border-purple-400" : "hover:border-purple-A400"
  } hover:delay-100`;

  const hoverText = `cursor-pointer ${
    isDark ? "hover:text-purple-400" : "hover:text-purple-A400"
  } hover:delay-100`;

  const colorText = `${isDark ? "text-purple-400" : "text-purple-A400"}`;

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
          colorText,
          backgroundStyleString,
        }}
      >
        <CssBaseline />
        <IsAuth>
          <IsMobile>
            <Head>
              <title>Inside Break</title>
            </Head>
            <TheInbox>
              <GlobalSearch>
                <Navbar />
                <Component {...pageProps} />
              </GlobalSearch>
            </TheInbox>
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
