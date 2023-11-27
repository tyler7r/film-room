import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type MobileProps = {
  children: ReactNode;
};

export const IsMobileContext = createContext<boolean>(false);

export const IsMobile = ({ children }: MobileProps) => {
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
      {children}
    </IsMobileContext.Provider>
  );
};

export const useMobileContext = () => {
  return useContext(IsMobileContext);
};
