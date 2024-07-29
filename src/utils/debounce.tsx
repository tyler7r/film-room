import { debounce } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { PlaySearchOptions } from "~/components/play-index";

const useDebounce = (
  callback: (options?: PlaySearchOptions) => Promise<void>,
) => {
  const ref = useRef<() => Promise<void>>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, 300);
  }, []);

  return debouncedCallback;
};

export default useDebounce;
