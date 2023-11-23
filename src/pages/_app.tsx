import { type AppType } from "next/app";

import { api } from "~/utils/api";

import { Navbar } from "~/components/navbar/navbar";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Navbar size="desktop" />
      <Component {...pageProps} />
    </>
  );
};

export default api.withTRPC(MyApp);
