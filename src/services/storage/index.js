import { useRef, useEffect } from "react";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

if (process.env.NODE_ENV === "development") {
  global.storage = storage;
}

// prevents cyclic require.
const log = {
  debug: function (message, payload = {}) {
    import("@/src/services/log").then(({ default: log }) => {
      log.default.debug(message, payload);
    });
  },
};

function clearTemporaryKeys() {
  const keys = storage.getAllKeys();
  log.debug("Found storage keys.", { keys });
  keys.forEach((key) => {
    if (key.includes("__tmp_")) {
      log.debug(`Clearing temporary key ${key}`);
      storage.delete(key);
    }
  });
}

function onMount() {
  log.debug("Storage mount event fired.");
  clearTemporaryKeys();
}

function onUnmount() {
  log.debug("Storage unmount event fired.");
  clearTemporaryKeys();
}

export function useStorageLifecycle() {
  const isEvaluatedRef = useRef(false);

  if (isEvaluatedRef.current === false) {
    isEvaluatedRef.current = true;
    onMount();
  }

  useEffect(() => onUnmount, []);
}

export default storage;
