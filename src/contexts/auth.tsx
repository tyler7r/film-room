import { ReactNode, createContext, useContext, useState } from "react";

export const isAuthContext = createContext<boolean>(false);

export const isAuth = (children: ReactNode) => {
  const [auth, setAuth] = useState<boolean>(false);

  return (
    <isAuthContext.Provider value={auth}>{children}</isAuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(isAuthContext);
};
