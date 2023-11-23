import { type AppType } from "next/app";
import { createContext, useEffect, useState } from "react";

import { Navbar } from "~/components/navbar/navbar";
import "~/styles/globals.css";

export const IsMobileContext = createContext<boolean>(false);

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (window.innerWidth <= 480) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 480) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    });
  }, []);

  return (
    <IsMobileContext.Provider value={isMobile}>
      <Navbar />
      <Component {...pageProps} />
    </IsMobileContext.Provider>
  );
};

export default MyApp;
