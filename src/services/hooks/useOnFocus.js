import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function useOnFocus(callback = () => {}) {
  useFocusEffect(useCallback(callback, []));
}
