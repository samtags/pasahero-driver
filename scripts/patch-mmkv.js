const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const mmkvRoot = path.join(projectRoot, 'node_modules', 'react-native-mmkv');
const expoModulesCoreCmake = path.join(
  projectRoot,
  'node_modules',
  'expo-modules-core',
  'android',
  'CMakeLists.txt'
);
const expoModulesCoreEventEmitter = path.join(
  projectRoot,
  'node_modules',
  'expo-modules-core',
  'common',
  'cpp',
  'EventEmitter.cpp'
);
const expoModulesCoreJNIToJSI = path.join(
  projectRoot,
  'node_modules',
  'expo-modules-core',
  'android',
  'src',
  'main',
  'cpp',
  'types',
  'JNIToJSIConverter.cpp'
);
const targetPath = path.join(
  mmkvRoot,
  'android',
  'src',
  'main',
  'java',
  'com',
  'mrousavy',
  'mmkv',
  'NativeMmkvPlatformContextSpec.java'
);

const hasMmkv = fs.existsSync(mmkvRoot);
const hasExpoModulesCore =
  fs.existsSync(expoModulesCoreCmake) &&
  fs.existsSync(expoModulesCoreEventEmitter) &&
  fs.existsSync(expoModulesCoreJNIToJSI);

if (!hasMmkv && !hasExpoModulesCore) {
  // Dependencies not installed (yet).
  process.exit(0);
}

const content = `package com.mrousavy.mmkv;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;

/**
 * Fallback Spec for old-arch builds where codegen isn't run.
 * This mirrors the generated Spec class shape used by TurboModules.
 */
public abstract class NativeMmkvPlatformContextSpec extends ReactContextBaseJavaModule implements TurboModule {
    public static final String NAME = "MmkvPlatformContext";

    protected NativeMmkvPlatformContextSpec(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public final String getName() {
        return NAME;
    }

    public abstract String getBaseDirectory();

    @Nullable
    public abstract String getAppGroupDirectory();
}
`;

if (hasMmkv) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const current = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';
  if (current !== content) {
    fs.writeFileSync(targetPath, content, 'utf8');
    // eslint-disable-next-line no-console
    console.log('[patch-mmkv] Wrote fallback NativeMmkvPlatformContextSpec.java');
  }
}

if (hasExpoModulesCore) {
  const cmakeContents = fs.readFileSync(expoModulesCoreCmake, 'utf8');
  let updated = cmakeContents.replace(
    /set\\(CMAKE_CXX_STANDARD\\s+20\\)/,
    'set(CMAKE_CXX_STANDARD 17)'
  );
  if (!updated.includes('-DFOLLY_HAS_STRING_VIEW=0')) {
    updated = updated.replace(
      /target_compile_options\\([\\s\\S]*?\\$\\{folly_FLAGS\\}[\\s\\S]*?\\)/,
      (match) =>
        match.replace(
          '${folly_FLAGS}',
          '${folly_FLAGS}\\n        -DFOLLY_HAS_STRING_VIEW=0'
        )
    );
  }
  if (updated !== cmakeContents) {
    fs.writeFileSync(expoModulesCoreCmake, updated, 'utf8');
    // eslint-disable-next-line no-console
    console.log('[patch-mmkv] Patched expo-modules-core CMake settings');
  }

  const eventEmitter = fs.readFileSync(expoModulesCoreEventEmitter, 'utf8');
  if (eventEmitter.includes('listenersMap.contains(')) {
    // More explicit replacements to avoid unintended edits
    const fixed = eventEmitter
      .replace('if (!listenersMap.contains(eventName)) {', 'if (listenersMap.find(eventName) == listenersMap.end()) {')
      .replace('if (listenersMap.contains(eventName)) {', 'if (listenersMap.find(eventName) != listenersMap.end()) {')
      .replace('if (!listenersMap.contains(eventName)) {', 'if (listenersMap.find(eventName) == listenersMap.end()) {')
      .replace('if (!listenersMap.contains(eventName)) {', 'if (listenersMap.find(eventName) == listenersMap.end()) {');
    fs.writeFileSync(expoModulesCoreEventEmitter, fixed, 'utf8');
    // eslint-disable-next-line no-console
    console.log('[patch-mmkv] Patched expo-modules-core EventEmitter.cpp for C++17');
  }

  const jniToJsi = fs.readFileSync(expoModulesCoreJNIToJSI, 'utf8');
  const jniToJsiFixed = jniToJsi.replace(
    'string.starts_with(DYNAMIC_EXTENSION_PREFIX)',
    'string.rfind(DYNAMIC_EXTENSION_PREFIX, 0) == 0'
  );
  if (jniToJsiFixed !== jniToJsi) {
    fs.writeFileSync(expoModulesCoreJNIToJSI, jniToJsiFixed, 'utf8');
    // eslint-disable-next-line no-console
    console.log('[patch-mmkv] Patched JNIToJSIConverter.cpp starts_with');
  }

  // Ensure Folly respects a pre-defined FOLLY_HAS_STRING_VIEW from build flags.
  const gradleCacheRoot = path.join(process.env.HOME || '', '.gradle', 'caches');
  const portabilityPathSuffix = path.join(
    'react-android-0.76.7-release',
    'prefab',
    'modules',
    'reactnative',
    'include',
    'folly',
    'Portability.h'
  );
  const portabilityCandidates = [];
  const walk = (dir) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (fullPath.endsWith(path.dirname(portabilityPathSuffix))) {
            const candidate = path.join(fullPath, path.basename(portabilityPathSuffix));
            if (fs.existsSync(candidate)) portabilityCandidates.push(candidate);
          } else {
            walk(fullPath);
          }
        }
      }
    } catch (_) {
      // ignore unreadable paths
    }
  };
  if (gradleCacheRoot && fs.existsSync(gradleCacheRoot)) {
    walk(gradleCacheRoot);
    for (const file of portabilityCandidates) {
      const contents = fs.readFileSync(file, 'utf8');
      if (!contents.includes('#ifndef FOLLY_HAS_STRING_VIEW')) {
        const updatedContents = contents.replace(
          /#if __has_include\\(<string_view>\\) && FOLLY_CPLUSPLUS >= 201703L\\n#define FOLLY_HAS_STRING_VIEW 1\\n#else\\n#define FOLLY_HAS_STRING_VIEW 0\\n#endif/,
          '#ifndef FOLLY_HAS_STRING_VIEW\\n#if __has_include(<string_view>) && FOLLY_CPLUSPLUS >= 201703L\\n#define FOLLY_HAS_STRING_VIEW 1\\n#else\\n#define FOLLY_HAS_STRING_VIEW 0\\n#endif\\n#endif'
        );
        if (updatedContents !== contents) {
          fs.writeFileSync(file, updatedContents, 'utf8');
          // eslint-disable-next-line no-console
          console.log('[patch-mmkv] Patched Folly Portability.h in Gradle cache');
        }
      }
    }
  }
}
