import { useEffect, useState, useRef } from "react";

/**
 * Throttle hook: Returns a throttled version of the input value.
 * The value will update at most once per `delay` milliseconds.
 *
 * @param {string} value
 * @param {number} delay - Throttle delay in milliseconds
 * @returns {string} Throttled value
 */
export default function useThrottledValue(value, delay) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const remainingTime = delay - (now - lastExecuted.current);

    if (remainingTime <= 0) {
      // Update immediately
      setThrottledValue(value);
      lastExecuted.current = now;
    } else {
      // Schedule the update
      const handler = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, remainingTime);

      return () => clearTimeout(handler);
    }
  }, [value, delay]);

  return throttledValue;
}
