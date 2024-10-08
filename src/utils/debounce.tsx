import { debounce } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";

const useDebounce = (callback: () => Promise<void>) => {
  const ref = useRef<() => Promise<void>>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      void ref.current?.();
    };

    return debounce(func, 200);
  }, []);

  return debouncedCallback;
};

export default useDebounce;
