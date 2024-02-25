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

type MobileContextType = {
  isMobile: boolean;
  screenWidth: number;
};

export const IsMobileContext = createContext<MobileContextType>({
  isMobile: false,
  screenWidth: 0,
});

export const IsMobile = ({ children }: MobileProps) => {
  const [isMobile, setIsMobile] = useState<MobileContextType>({
    isMobile: false,
    screenWidth: 0,
  });

  useEffect(() => {
    if (window.innerWidth <= 480) {
      setIsMobile({ isMobile: true, screenWidth: window.innerWidth });
    } else {
      setIsMobile({ isMobile: false, screenWidth: window.innerWidth });
    }
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 480) {
        setIsMobile({ isMobile: true, screenWidth: window.innerWidth });
      } else {
        setIsMobile({ isMobile: false, screenWidth: window.innerWidth });
      }
    });
    return () =>
      window.removeEventListener("resize", () => {
        if (window.innerWidth <= 480) {
          setIsMobile({ isMobile: true, screenWidth: window.innerWidth });
        } else {
          setIsMobile({ isMobile: false, screenWidth: window.innerWidth });
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
