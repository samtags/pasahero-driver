module.exports = ({ config }) => {
  // You can access the static configuration from app.json via the `config` object
  // console.debug("🚀 ~ name:", config.name);

  // Modify or extend the configuration as needed
  return {
    ...config,
    extra: {
      eas: {
        projectId: "2edea32b-6502-426d-bbd6-bfbe43e700a5",
      },
    },
    updates: {
      url: "https://u.expo.dev/2edea32b-6502-426d-bbd6-bfbe43e700a5",
    },
    runtimeVersion: "1.0.12",
    plugins: [
      "expo-font",
      "expo-router",
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location",
        },
      ],
      "@config-plugins/react-native-webrtc",
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_KEY,
        },
      ],
    ],
  };
};
