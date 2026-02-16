import {
  LDProvider,
  ReactNativeLDClient,
  AutoEnvAttributes,
} from "@launchdarkly/react-native-client-sdk";
import { useEffect } from "react";

const ctx = {
  kind: "user",
  key: "anonymous-key",
  debug: true,
  applicationInfo: {
    name: "com.passenger.pasahero",
    version: "1.1.8",
  },
};

const client = new ReactNativeLDClient(
  process.env.EXPO_PUBLIC_LD_KEY,
  AutoEnvAttributes.Enabled,
);

const LaunchdarklyProvider = ({ children }) => {
  useEffect(() => {
    client.identify(ctx).catch((e) => console.debug(e));
  }, []);

  return <LDProvider client={client}>{children}</LDProvider>;
};

export default LaunchdarklyProvider;
