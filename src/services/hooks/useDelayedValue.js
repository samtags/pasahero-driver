import { useEffect, useState } from "react";

/**
 *
 * @param {string} value
 * @param {number} delay
 * @returns
 */
export default function useDelayedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    if (!value) {
      clearTimeout(handler);
      setDebouncedValue(value);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
