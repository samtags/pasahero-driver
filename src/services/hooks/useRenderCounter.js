import { useRef } from "react";

export default function useRenderCounter(componentName) {
  const renderCountRef = useRef(0);
  console.debug(`[${componentName}]:`, renderCountRef.current++);
}
