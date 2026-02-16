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

function assertDoesNotContain(filePath, pattern, message) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`patch-16k: required file missing: ${filePath}`);
  }
  const content = readFile(filePath);
  if (pattern.test(content)) {
    throw new Error(`patch-16k: ${message} (${filePath})`);
  }
}

const patches = [
  {
    file: "node_modules/react-native/ReactAndroid/src/main/jni/CMakeLists.txt",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /find_package\(hermes-engine REQUIRED CONFIG\)\nfind_package\(fbjni REQUIRED CONFIG\)/,
        'find_package(hermes-engine REQUIRED CONFIG)\n# Some builds expose hermes-engine::libhermes as an INTERFACE target without\n# a linked library. Fall back to the hermes-engine build outputs when needed.\nget_target_property(_hermes_link hermes-engine::libhermes INTERFACE_LINK_LIBRARIES)\nif(_hermes_link STREQUAL "")\n  if(CMAKE_BUILD_TYPE STREQUAL "Debug")\n    set(_hermes_variant "debug")\n  elseif(CMAKE_BUILD_TYPE STREQUAL "RelWithDebInfo")\n    set(_hermes_variant "debugOptimized")\n  else()\n    set(_hermes_variant "release")\n  endif()\n\n  set(_hermes_candidates\n      "${REACT_ANDROID_DIR}/hermes-engine/build/intermediates/cmake/${_hermes_variant}/obj/${ANDROID_ABI}/libhermes.so"\n      "${REACT_ANDROID_DIR}/hermes-engine/build/intermediates/cmake/release/obj/${ANDROID_ABI}/libhermes.so"\n      "${REACT_ANDROID_DIR}/hermes-engine/build/intermediates/cmake/debugOptimized/obj/${ANDROID_ABI}/libhermes.so"\n      "${REACT_ANDROID_DIR}/hermes-engine/build/intermediates/cmake/debug/obj/${ANDROID_ABI}/libhermes.so")\n\n  set(_hermes_path "")\n  foreach(_candidate IN LISTS _hermes_candidates)\n    if(EXISTS "${_candidate}")\n      set(_hermes_path "${_candidate}")\n      break()\n    endif()\n  endforeach()\n\n  if(_hermes_path STREQUAL "")\n    message(WARNING "libhermes.so not found in hermes-engine build outputs; continuing with prefab Hermes target.")\n  endif()\n\n  set_target_properties(hermes-engine::libhermes PROPERTIES\n      INTERFACE_LINK_LIBRARIES "${_hermes_path}")\nendif()\nfind_package(fbjni REQUIRED CONFIG)'
      ),
  },
  {
    file: "android/app/build.gradle",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /versionName "1\.1\.7"\n/,
        '\n        // 16KB page size requires 64-bit only; exclude 32-bit ABIs.\n        ndk {\n            abiFilters "arm64-v8a", "x86_64"\n        }'
      ),
  },
  {
    file: "android/gradle.properties",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /reactNativeArchitectures=.*\n/,
        "reactNativeArchitectures=arm64-v8a\n"
      ),
  },
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
    file: "node_modules/react-native/ReactAndroid/hermes-engine/build.gradle.kts",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /arguments\("-DCMAKE_BUILD_TYPE=Release"\)/,
        '          arguments("-DHERMES_ENABLE_DEBUGGER=True")'
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
    file: "node_modules/react-native/ReactAndroid/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /compileOnly\(project\(":ReactAndroid:hermes-engine"\)\)/,
        'implementation(project(":ReactAndroid:hermes-engine"))'
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
    file: "node_modules/react-native/ReactAndroid/build.gradle.kts",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /buildTypes \{\n/,
        '    getByName("release") {\n      externalNativeBuild {\n        cmake { arguments("-DCMAKE_BUILD_TYPE=Release") }\n      }\n    }'
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
    file: "node_modules/react-native/ReactAndroid/hermes-engine/build.gradle.kts",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /"-DHERMES_ENABLE_DEBUGGER=False"\)/,
        '"-DHERMES_ENABLE_DEBUGGER=True")'
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
      ensureReplace(
        filePath,
        /find_package\(hermes-engine REQUIRED CONFIG\)\nendif\(\)/,
        'find_package(hermes-engine REQUIRED CONFIG)\n\n  # Prefab can expose libhermes as headers-only; add a fallback to the built .so.\n  get_target_property(_hermes_link hermes-engine::libhermes INTERFACE_LINK_LIBRARIES)\n  if(_hermes_link STREQUAL "")\n    if(CMAKE_BUILD_TYPE STREQUAL "Debug")\n      set(_hermes_variant "debug")\n    elseif(CMAKE_BUILD_TYPE STREQUAL "RelWithDebInfo")\n      set(_hermes_variant "debugOptimized")\n    else()\n      set(_hermes_variant "release")\n    endif()\n\n    set(_hermes_candidates\n        "${REACT_NATIVE_DIR}/ReactAndroid/hermes-engine/build/intermediates/cmake/${_hermes_variant}/obj/${ANDROID_ABI}/libhermes.so"\n        "${REACT_NATIVE_DIR}/ReactAndroid/hermes-engine/build/intermediates/cmake/release/obj/${ANDROID_ABI}/libhermes.so"\n        "${REACT_NATIVE_DIR}/ReactAndroid/hermes-engine/build/intermediates/cmake/debugOptimized/obj/${ANDROID_ABI}/libhermes.so"\n        "${REACT_NATIVE_DIR}/ReactAndroid/hermes-engine/build/intermediates/cmake/debug/obj/${ANDROID_ABI}/libhermes.so")\n\n    set(_hermes_path "")\n    foreach(_candidate IN LISTS _hermes_candidates)\n      if(EXISTS "${_candidate}")\n        set(_hermes_path "${_candidate}")\n        break()\n      endif()\n    endforeach()\n\n    if(_hermes_path STREQUAL "")\n      message(WARNING "libhermes.so not found in hermes-engine build outputs; continuing with prefab Hermes target.")\n    endif()\n\n    set_target_properties(hermes-engine::libhermes PROPERTIES\n        INTERFACE_LINK_LIBRARIES "${_hermes_path}")\n  endif()\nendif()'
      ),
  },
  {
    file: "node_modules/react-native-worklets/android/CMakeLists.txt",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /find_package\(ReactAndroid REQUIRED CONFIG\)\n/,
        '\n# If ReactAndroid prefab targets don\'t expose libraries, fall back to build outputs.\nfunction(_set_reactandroid_lib target_name lib_name)\n  if(NOT TARGET ${target_name})\n    add_library(${target_name} SHARED IMPORTED)\n  endif()\n  get_target_property(_ra_imported ${target_name} IMPORTED_LOCATION)\n  if(_ra_imported AND NOT _ra_imported STREQUAL "NOTFOUND")\n    return()\n  endif()\n\n  if(CMAKE_BUILD_TYPE STREQUAL "Debug")\n    set(_ra_variant "Debug")\n  elseif(CMAKE_BUILD_TYPE STREQUAL "RelWithDebInfo")\n    set(_ra_variant "RelWithDebInfo")\n  else()\n    set(_ra_variant "Release")\n  endif()\n\n  file(GLOB _ra_candidates\n       "${REACT_NATIVE_DIR}/ReactAndroid/build/intermediates/cxx/${_ra_variant}/*/obj/${ANDROID_ABI}/${lib_name}")\n\n  list(LENGTH _ra_candidates _ra_count)\n  if(_ra_count EQUAL 0)\n    return()\n  endif()\n\n  list(GET _ra_candidates 0 _ra_path)\n  set_target_properties(${target_name} PROPERTIES\n      IMPORTED_LOCATION "${_ra_path}")\nendfunction()\n\n_set_reactandroid_lib(ReactAndroid::jsi "libjsi.so")\n_set_reactandroid_lib(ReactAndroid::reactnative "libreactnative.so")\n_set_reactandroid_lib(ReactAndroid::hermestooling "libhermestooling.so")\n'
      ),
  },
  {
    file: "node_modules/react-native-reanimated/android/CMakeLists.txt",
    apply: (filePath) =>
      ensureLineAfter(
        filePath,
        /find_package\(ReactAndroid REQUIRED CONFIG\)\n/,
        '\n# If ReactAndroid prefab targets don\'t expose libraries, fall back to build outputs.\nfunction(_set_reactandroid_lib target_name lib_name)\n  if(NOT TARGET ${target_name})\n    add_library(${target_name} SHARED IMPORTED)\n  endif()\n  get_target_property(_ra_imported ${target_name} IMPORTED_LOCATION)\n  if(_ra_imported AND NOT _ra_imported STREQUAL "NOTFOUND")\n    return()\n  endif()\n\n  if(CMAKE_BUILD_TYPE STREQUAL "Debug")\n    set(_ra_variant "Debug")\n  elseif(CMAKE_BUILD_TYPE STREQUAL "RelWithDebInfo")\n    set(_ra_variant "RelWithDebInfo")\n  else()\n    set(_ra_variant "Release")\n  endif()\n\n  file(GLOB _ra_candidates\n       "${REACT_NATIVE_DIR}/ReactAndroid/build/intermediates/cxx/${_ra_variant}/*/obj/${ANDROID_ABI}/${lib_name}")\n\n  list(LENGTH _ra_candidates _ra_count)\n  if(_ra_count EQUAL 0)\n    return()\n  endif()\n\n  list(GET _ra_candidates 0 _ra_path)\n  set_target_properties(${target_name} PROPERTIES\n      IMPORTED_LOCATION "${_ra_path}")\nendfunction()\n\n_set_reactandroid_lib(ReactAndroid::jsi "libjsi.so")\n_set_reactandroid_lib(ReactAndroid::reactnative "libreactnative.so")\n'
      ),
  },
  {
    file: "node_modules/react-native-reanimated/android/CMakeLists.txt",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /target_link_libraries\(reanimated ReactAndroid::reactnative ReactAndroid::fabricjni\)/,
        "target_link_libraries(reanimated ReactAndroid::reactnative)"
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
  {
    file: "node_modules/react-native-maps/android/src/main/jni/react/renderer/components/RNMapsSpecs/ComponentDescriptors.cpp",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /registry->add\(concreteComponentDescriptorProvider<RNMapsUrlTileComponentDescriptor>\(\)\);\n/,
        "// Workaround: skip UrlTile Fabric descriptor due release startup crash.\n"
      ),
  },
  {
    file: "node_modules/react-native-maps/android/src/main/jni/react/renderer/components/RNMapsSpecs/ComponentDescriptors.cpp",
    apply: (filePath) =>
      ensureReplace(
        filePath,
        /registry->add\(concreteComponentDescriptorProvider<RNMapsWMSTileComponentDescriptor>\(\)\);\n/,
        "// Workaround: skip WMSTile Fabric descriptor due release startup crash.\n"
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

assertDoesNotContain(
  path.join(root, "node_modules/react-native-reanimated/android/CMakeLists.txt"),
  /target_link_libraries\(reanimated ReactAndroid::reactnative ReactAndroid::fabricjni\)/,
  "invalid Reanimated native link override found"
);

assertDoesNotContain(
  path.join(root, "node_modules/react-native/ReactAndroid/src/main/jni/CMakeLists.txt"),
  /message\(FATAL_ERROR "libhermes\.so not found in hermes-engine build outputs\."\)/,
  "fatal Hermes fallback detected in ReactAndroid CMake"
);

assertDoesNotContain(
  path.join(root, "node_modules/react-native-worklets/android/CMakeLists.txt"),
  /message\(FATAL_ERROR "libhermes\.so not found in hermes-engine build outputs\."\)/,
  "fatal Hermes fallback detected in Worklets CMake"
);

const mapsDescriptors = path.join(
  root,
  "node_modules/react-native-maps/android/src/main/jni/react/renderer/components/RNMapsSpecs/ComponentDescriptors.cpp"
);
if (fs.existsSync(mapsDescriptors)) {
  assertDoesNotContain(
    mapsDescriptors,
    /registry->add\(concreteComponentDescriptorProvider<RNMapsUrlTileComponentDescriptor>\(\)\);/,
    "RNMaps UrlTile Fabric descriptor is still enabled"
  );
  assertDoesNotContain(
    mapsDescriptors,
    /registry->add\(concreteComponentDescriptorProvider<RNMapsWMSTileComponentDescriptor>\(\)\);/,
    "RNMaps WMSTile Fabric descriptor is still enabled"
  );
}

if (changed > 0) {
  console.log(`patch-16k: updated ${changed} file(s).`);
} else {
  console.log("patch-16k: no changes needed.");
}
