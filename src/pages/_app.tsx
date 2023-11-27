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
