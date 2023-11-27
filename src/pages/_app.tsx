import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { type AppType } from "next/app";
import { createContext } from "react";

import { Navbar } from "~/components/navbar/navbar";
import { IsMobile } from "~/contexts/mobile";
import "~/styles/globals.css";

export const IsMobileContext = createContext<boolean>(false);

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <IsMobile>
      <Navbar />
      <Component {...pageProps} />
    </IsMobile>
  );
};

export default MyApp;
