import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type MobileProps = {
  children: ReactNode;
};

export const IsMobileContext = createContext<boolean | undefined>(false);

export const IsMobile = ({ children }: MobileProps) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (window.innerWidth <= 842) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 842) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    });
    return () =>
      window.removeEventListener("resize", () => {
        if (window.innerWidth <= 842) {
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
