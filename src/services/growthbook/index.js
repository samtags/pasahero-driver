import { GrowthBook, GrowthBookProvider } from "@growthbook/growthbook-react";
import { useEffect } from "react";
import { setPolyfills } from "@growthbook/growthbook";
import EventSource from "react-native-sse";

setPolyfills({ EventSource: EventSource });

// Create a GrowthBook instance
export const gb = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: process.env.EXPO_PUBLIC_GB_KEY,
  backgroundSync: true,
  subscribeToChanges: true,
  streaming: true,
  enableDevMode: true,
  debug: true,
  environment: process.env.NODE_ENV,
  attributes: {
    service: "com.pasahero.driver",
    version: "1.1.9",
  },
});

const originalSetPayload = gb.setPayload.bind(gb);

gb.setPayload = async (payload = {}) => {
  return originalSetPayload({
    ...payload,
    features: payload.features ?? {},
  });
};

export default function Provider({ children }) {
  useEffect(() => {
    (async () => {
      const res = await gb.init({
        streaming: true,
        skipCache: true,
        timeout: 7000,
      });

      console.log("GB init result:", res);
    })();
  }, []);
  return <GrowthBookProvider growthbook={gb}>{children}</GrowthBookProvider>;
}
