const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const mmkvRoot = path.join(projectRoot, 'node_modules', 'react-native-mmkv');
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

if (!fs.existsSync(mmkvRoot)) {
  // Dependency not installed (yet).
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

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
const current = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';
if (current !== content) {
  fs.writeFileSync(targetPath, content, 'utf8');
  // eslint-disable-next-line no-console
  console.log('[patch-mmkv] Wrote fallback NativeMmkvPlatformContextSpec.java');
}
