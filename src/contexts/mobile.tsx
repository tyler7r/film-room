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
  fullScreen: boolean;
};

export const IsMobileContext = createContext<MobileContextType>({
  isMobile: false,
  screenWidth: 0,
  fullScreen: false,
});

export const IsMobile = ({ children }: MobileProps) => {
  const [isMobile, setIsMobile] = useState<MobileContextType>({
    isMobile: false,
    screenWidth: 0,
    fullScreen: false,
  });

  useEffect(() => {
    if (window.innerWidth <= 480) {
      setIsMobile({
        isMobile: true,
        screenWidth: window.innerWidth,
        fullScreen: false,
      });
    } else if (window.innerWidth >= 1020) {
      setIsMobile({
        isMobile: false,
        screenWidth: window.innerWidth,
        fullScreen: true,
      });
    } else {
      setIsMobile({
        isMobile: false,
        screenWidth: window.innerWidth,
        fullScreen: false,
      });
    }
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 480) {
        setIsMobile({
          isMobile: true,
          screenWidth: window.innerWidth,
          fullScreen: false,
        });
      } else if (window.innerWidth >= 1020) {
        setIsMobile({
          isMobile: false,
          screenWidth: window.innerWidth,
          fullScreen: true,
        });
      } else {
        setIsMobile({
          isMobile: false,
          screenWidth: window.innerWidth,
          fullScreen: false,
        });
      }
    });
    return () =>
      window.removeEventListener("resize", () => {
        if (window.innerWidth <= 480) {
          setIsMobile({
            isMobile: true,
            screenWidth: window.innerWidth,
            fullScreen: false,
          });
        } else if (window.innerWidth >= 1020) {
          setIsMobile({
            isMobile: false,
            screenWidth: window.innerWidth,
            fullScreen: true,
          });
        } else {
          setIsMobile({
            isMobile: false,
            screenWidth: window.innerWidth,
            fullScreen: false,
          });
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
