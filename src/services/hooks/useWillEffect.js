import { useEffect, useRef } from "react";
import log from "@/src/services/log";

export default function useWillEffect(effect) {
  const isMountedRef = useRef(false);
  const isExecuted = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  if (isMountedRef.current || isExecuted.current) {
    log.debug("Skipping effect execution. Already mounted or executed.");
    return;
  }

  log.debug("Executing effect.");
  effect();
  isExecuted.current = true;
}
