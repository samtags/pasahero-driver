#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function ensureReplace(filePath, pattern, replacement) {
  const original = readFile(filePath);
  if (!pattern.test(original)) {
    return false;
  }
  const updated = original.replace(pattern, replacement);
  if (updated === original) {
    return false;
  }
  writeFile(filePath, updated);
  return true;
}

function ensureLineAfter(filePath, anchorRegex, lineToInsert) {
  const original = readFile(filePath);
  if (original.includes(lineToInsert)) {
    return false;
  }
  const match = original.match(anchorRegex);
  if (!match) {
    return false;
  }
  const updated = original.replace(anchorRegex, `${match[0]}\n${lineToInsert}\n`);
  if (updated === original) {
    return false;
  }
  writeFile(filePath, updated);
  return true;
}

const patches = [
  {
    file: "node_modules/react-native/ReactAndroid/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /plugins \{\n  id\("maven-publish"\)\n  id\("com.facebook.react"\)\n  alias\(libs.plugins.android.library\)\n  alias\(libs.plugins.download\)\n  alias\(libs.plugins.kotlin.android\)\n\}/,
        'plugins {\n  id("maven-publish")\n  id("com.facebook.react")\n  id("com.android.library")\n  id("de.undercouch.download") version "5.4.0"\n  id("org.jetbrains.kotlin.android")\n}'
      ),
  },
  {
    file: "node_modules/react-native/ReactAndroid/hermes-engine/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /plugins \{\n  id\("maven-publish"\)\n  id\("signing"\)\n  alias\(libs.plugins.android.library\)\n  alias\(libs.plugins.download\)\n\}/,
        'plugins {\n  id("maven-publish")\n  id("signing")\n  id("com.android.library")\n  id("de.undercouch.download") version "5.4.0"\n}'
      ),
  },
  {
    file: "node_modules/react-native/ReactAndroid/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /":packages:react-native:ReactAndroid:hermes-engine:preBuild"\)/g,
        '":ReactAndroid:hermes-engine:preBuild")'
      ),
  },
  {
    file: "node_modules/react-native/ReactAndroid/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /project\(":packages:react-native:ReactAndroid:hermes-engine"\)/g,
        'project(":ReactAndroid:hermes-engine")'
      ),
  },
  {
    file: "node_modules/react-native/ReactAndroid/publish.gradle",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /project\(':packages:react-native:ReactAndroid'\)/g,
        "project(':ReactAndroid')"
      ),
  },
  {
    file: "node_modules/react-native/ReactAndroid/hermes-engine/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /project\(":packages:react-native:ReactAndroid"\)/g,
        'project(":ReactAndroid")'
      ),
  },
  {
    file: "node_modules/react-native/ReactAndroid/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /rootProjectName\.set\(rootProject\.name\)\n\s*\}/,
        "rootProjectName.set(rootProject.name)\n      // Use prebuilt codegen JS from npm package; skip building CLI.\n      enabled = false\n    }"
      ),
  },
  {
    file: "node_modules/react-native/ReactAndroid/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /"-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON",\n/,
        '"-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON",\n            "-DCMAKE_SHARED_LINKER_FLAGS=-Wl,-z,max-page-size=16384",\n'
      ),
  },
  {
    file: "node_modules/react-native/ReactAndroid/hermes-engine/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /"-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON",\n/,
        '"-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON",\n            "-DCMAKE_SHARED_LINKER_FLAGS=-Wl,-z,max-page-size=16384",\n'
      ),
  },
  {
    file: "node_modules/react-native-reanimated/android/CMakeLists.txt",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /set_target_properties\(reanimated PROPERTIES LINK_FLAGS "-Wl,--gc-sections"\)/,
        'set_target_properties(reanimated PROPERTIES LINK_FLAGS "-Wl,--gc-sections -Wl,-z,max-page-size=16384")'
      ),
  },
  {
    file: "node_modules/react-native-worklets/android/CMakeLists.txt",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /set_target_properties\(worklets PROPERTIES LINKER_LANGUAGE CXX\)/,
        'set_target_properties(worklets PROPERTIES LINK_FLAGS "-Wl,-z,max-page-size=16384")'
      ),
  },
  {
    file: "node_modules/react-native-screens/android/src/main/jni/CMakeLists.txt",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /add_library\(\n  \${LIB_TARGET_NAME}\n  SHARED[\s\S]*?\)\n/,
        'set_target_properties(${LIB_TARGET_NAME} PROPERTIES LINK_FLAGS "-Wl,-z,max-page-size=16384")'
      ),
  },
  {
    file: "node_modules/react-native-screens/android/CMakeLists.txt",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /add_library\(rnscreens[\s\S]*?\)\n/,
        'set_target_properties(rnscreens PROPERTIES LINK_FLAGS "-Wl,-z,max-page-size=16384")'
      ),
  },
  {
    file: "node_modules/expo-av/android/CMakeLists.txt",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /add_library\([\s\S]*?\)\n/,
        'set_target_properties(${PACKAGE_NAME} PROPERTIES LINK_FLAGS "-Wl,-z,max-page-size=16384")'
      ),
  },
  {
    file: "node_modules/react-native-gesture-handler/android/src/main/jni/CMakeLists.txt",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /add_library\(\$\{PACKAGE_NAME\}[\s\S]*?\)\n/,
        'set_target_properties(${PACKAGE_NAME} PROPERTIES LINK_FLAGS "-Wl,-z,max-page-size=16384")'
      ),
  },
];

let changed = 0;
let missing = 0;

for (const patch of patches) {
  const filePath = path.join(root, patch.file);
  if (!fs.existsSync(filePath)) {
    missing += 1;
    continue;
  }
  const didChange = patch.apply(filePath);
  if (didChange) {
    changed += 1;
  }
}

if (missing > 0) {
  console.warn(`patch-16k: ${missing} files were missing and skipped.`);
}

if (changed > 0) {
  console.log(`patch-16k: updated ${changed} file(s).`);
} else {
  console.log("patch-16k: no changes needed.");
}
