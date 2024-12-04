import { useEffect, useRef } from "react";

export default function useOnUpdate(callback = () => {}, dependencies = []) {
  const mountRef = useRef(false);

  useEffect(() => {
    if (mountRef.current) {
      return callback();
    }

    return () => {};
  }, [...dependencies]);

  useEffect(() => {
    mountRef.current = true;
  }, []);
}
