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
  xlScreen: boolean;
};

export const IsMobileContext = createContext<MobileContextType>({
  isMobile: false,
  screenWidth: 0,
  fullScreen: false,
  xlScreen: false,
});

export const IsMobile = ({ children }: MobileProps) => {
  const [isMobile, setIsMobile] = useState<MobileContextType>({
    isMobile: false,
    screenWidth: 0,
    fullScreen: false,
    xlScreen: false,
  });

  useEffect(() => {
    if (window.innerWidth <= 480) {
      setIsMobile({
        isMobile: true,
        screenWidth: window.innerWidth,
        fullScreen: false,
        xlScreen: false,
      });
    } else if (window.innerWidth >= 1440) {
      setIsMobile({
        isMobile: false,
        screenWidth: window.innerWidth,
        fullScreen: true,
        xlScreen: true,
      });
    } else if (window.innerWidth >= 1020 && window.innerWidth < 1440) {
      setIsMobile({
        isMobile: false,
        screenWidth: window.innerWidth,
        fullScreen: true,
        xlScreen: false,
      });
    } else {
      setIsMobile({
        isMobile: false,
        screenWidth: window.innerWidth,
        fullScreen: false,
        xlScreen: false,
      });
    }
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 480) {
        setIsMobile({
          isMobile: true,
          screenWidth: window.innerWidth,
          fullScreen: false,
          xlScreen: false,
        });
      } else if (window.innerWidth >= 1440) {
        setIsMobile({
          isMobile: false,
          screenWidth: window.innerWidth,
          fullScreen: true,
          xlScreen: true,
        });
      } else if (window.innerWidth >= 1020 && window.innerWidth < 1440) {
        setIsMobile({
          isMobile: false,
          screenWidth: window.innerWidth,
          fullScreen: true,
          xlScreen: false,
        });
      } else {
        setIsMobile({
          isMobile: false,
          screenWidth: window.innerWidth,
          fullScreen: false,
          xlScreen: false,
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
            xlScreen: false,
          });
        } else if (window.innerWidth >= 1440) {
          setIsMobile({
            isMobile: false,
            screenWidth: window.innerWidth,
            fullScreen: true,
            xlScreen: true,
          });
        } else if (window.innerWidth >= 1020 && window.innerWidth < 1440) {
          setIsMobile({
            isMobile: false,
            screenWidth: window.innerWidth,
            fullScreen: true,
            xlScreen: false,
          });
        } else {
          setIsMobile({
            isMobile: false,
            screenWidth: window.innerWidth,
            fullScreen: false,
            xlScreen: false,
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
