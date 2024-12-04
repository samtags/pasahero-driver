import { useState, useEffect } from "react";
import { AppState } from "react-native";
import useOnUpdate from "./useOnUpdate";

const useOnAppFocus = (cb = () => {}) => {
  const [appState, setAppState] = useState(AppState.currentState);

  useOnUpdate(() => {
    if (appState === "active") {
      cb?.();
    }
  }, [appState]);

  useEffect(() => {
    AppState?.addEventListener?.("change", handleAppStateChange);

    return () => {
      AppState?.removeEventListener?.("change", handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    setAppState(nextAppState);
  };

  return appState;
};

export default useOnAppFocus;
