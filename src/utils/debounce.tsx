import { debounce } from "@mui/material"; // Still using MUI's debounce
import { useEffect, useMemo, useRef } from "react";

/**
 * A custom hook to debounce an asynchronous function.
 * @template Args - The type of the arguments the callback function accepts.
 * @param {(...args: Args) => Promise<void>} callback - The asynchronous function to debounce, expected to return a Promise<void>.
 * @param {number} delay - The debounce delay in milliseconds. Defaults to 200ms.
 * @returns {(...args: Args) => void} The debounced function, which can be called with arguments and does not directly return the Promise.
 */
const useDebounce = <Args extends unknown[]>(
  callback: (...args: Args) => Promise<void>,
  delay = 200,
) => {
  // Use a Ref to store the latest callback function to avoid stale closures
  const callbackRef = useRef<(...args: Args) => Promise<void>>(callback);

  // Update the ref whenever the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Memoize the debounced function
  const debouncedFunction = useMemo(() => {
    // The inner function that will be debounced
    const func = (...args: Args) => {
      // Execute the latest version of the callback
      // We use `void` because the debounced function typically doesn't await the promise
      // or return it directly, but rather fires it and forgets.
      void callbackRef.current?.(...args);
    };

    // Apply the Material-UI debounce utility
    return debounce(func, delay);
  }, [delay]); // Recreate if delay changes

  return debouncedFunction;
};

export default useDebounce;
