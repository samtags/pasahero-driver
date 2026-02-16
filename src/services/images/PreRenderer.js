import { useEffect, useRef, useState } from "react";
import * as Images from "./remote";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import log from "@/src/services/log";

export default function ImagePreRenderer() {
  const ref = useRef(new Set(Object.keys(Images)));
  const start = useRef();

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      const end = Date.now();
      log.debug(`Pre-render Image Completed in ${end - start.current}ms`);
    } else {
      start.current = Date.now();
      log.debug("Pre-render Image is Ongoing.");
    }
  }, [isCompleted]);

  if (isCompleted) return null;

  return Object.keys(Images).map((key) => {
    const handleOnLoad = () => {
      const renderingImages = ref.current;

      renderingImages.delete(key);

      if (renderingImages.size === 0) {
        log.debug("Pre-render Image Completed in cache.");
        setIsCompleted(true);
      }
    };

    return (
      <Image
        key={key}
        style={IconStyle}
        onLoadEnd={handleOnLoad}
        source={Images[key]}
      />
    );
  });
}

export const IconStyle = StyleSheet.create({
  height: 25,
  width: 25,
  position: "absolute",
  left: -9999,
  opacity: 0,
});
