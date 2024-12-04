import { useRef, useEffect } from "react";
import useOnUpdate from "./useOnUpdate";

export default function useOnUpdateSnapshot(callback, deps) {
  const ref = useRef();

  useEffect(() => {
    ref.current = deps;
  }, []);

  useOnUpdate(() => {
    const cleanup = callback?.(ref.current, deps);

    return () => {
      ref.current = deps;
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [JSON.stringify(deps)]);
}
