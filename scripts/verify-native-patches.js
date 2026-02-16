#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`missing required file: ${relativePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function assertNotMatch(relativePath, pattern, message) {
  const content = read(relativePath);
  if (pattern.test(content)) {
    throw new Error(`${message} (${relativePath})`);
  }
}

function assertNotMatchIfExists(relativePath, pattern, message) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    return;
  }
  assertNotMatch(relativePath, pattern, message);
}

function main() {
  assertNotMatch(
    "node_modules/react-native-reanimated/android/CMakeLists.txt",
    /target_link_libraries\(reanimated ReactAndroid::reactnative ReactAndroid::fabricjni\)/,
    "invalid Reanimated native link override found"
  );

  assertNotMatch(
    "node_modules/react-native/ReactAndroid/src/main/jni/CMakeLists.txt",
    /message\(FATAL_ERROR "libhermes\.so not found in hermes-engine build outputs\."\)/,
    "fatal Hermes fallback detected in ReactAndroid CMake"
  );

  assertNotMatch(
    "node_modules/react-native-worklets/android/CMakeLists.txt",
    /message\(FATAL_ERROR "libhermes\.so not found in hermes-engine build outputs\."\)/,
    "fatal Hermes fallback detected in Worklets CMake"
  );

  assertNotMatchIfExists(
    "node_modules/react-native-maps/android/src/main/jni/react/renderer/components/RNMapsSpecs/ComponentDescriptors.cpp",
    /registry->add\(concreteComponentDescriptorProvider<RNMapsUrlTileComponentDescriptor>\(\)\);/,
    "RNMaps UrlTile Fabric descriptor is still enabled"
  );

  assertNotMatchIfExists(
    "node_modules/react-native-maps/android/src/main/jni/react/renderer/components/RNMapsSpecs/ComponentDescriptors.cpp",
    /registry->add\(concreteComponentDescriptorProvider<RNMapsWMSTileComponentDescriptor>\(\)\);/,
    "RNMaps WMSTile Fabric descriptor is still enabled"
  );

  console.log("verify-native-patches: OK");
}

main();
