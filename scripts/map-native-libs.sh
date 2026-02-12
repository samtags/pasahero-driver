#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GRADLE_CACHE="${GRADLE_USER_HOME:-$HOME/.gradle}"
TRANSFORMS_ROOT="$GRADLE_CACHE/caches"

if [[ ! -d "$TRANSFORMS_ROOT" ]]; then
  echo "error: Gradle cache not found at $TRANSFORMS_ROOT" >&2
  exit 2
fi

declare -a SEARCH_PATHS=()
if [[ $# -gt 0 ]]; then
  SEARCH_PATHS=("$@")
else
  SEARCH_PATHS+=("$ROOT_DIR/android/app/build/intermediates/merged_native_libs/release/mergeReleaseNativeLibs/out/lib")
  SEARCH_PATHS+=("$ROOT_DIR/android/app/build/outputs/bundle/release")
  SEARCH_PATHS+=("$ROOT_DIR/android/app/build/outputs/apk/release")
fi

python3 - <<'PY'
import os
import sys

root_dir = os.path.abspath(os.getcwd())
gradle_cache = os.environ.get("GRADLE_USER_HOME", os.path.expanduser("~/.gradle"))
transforms_root = os.path.join(gradle_cache, "caches")

search_paths = sys.argv[1:] or [
    os.path.join(root_dir, "android/app/build/intermediates/merged_native_libs/release/mergeReleaseNativeLibs/out/lib"),
    os.path.join(root_dir, "android/app/build/outputs/bundle/release"),
    os.path.join(root_dir, "android/app/build/outputs/apk/release"),
]

libs = set()
for path in search_paths:
    if not os.path.isdir(path):
        continue
    for base, _, files in os.walk(path):
        for name in files:
            if name.endswith(".so"):
                libs.add(name)

if not libs:
    print("no .so files found in:")
    for path in search_paths:
        print(f"  - {path}")
    print("Build a release bundle/apk first, then re-run.")
    sys.exit(1)

def iter_transformed_libs(root):
    for base, dirs, files in os.walk(root):
        if "transformed" not in base:
            continue
        for name in files:
            if not name.endswith(".so"):
                continue
            yield os.path.join(base, name)

def extract_artifact(path):
    parts = path.split(os.sep)
    try:
        idx = parts.index("transformed")
        return parts[idx + 1]
    except Exception:
        return "unknown"

def extract_abi(path):
    parts = path.split(os.sep)
    if "lib" in parts:
        try:
            idx = parts.index("lib")
            return parts[idx + 1]
        except Exception:
            pass
    if "jni" in parts:
        try:
            idx = parts.index("jni")
            return parts[idx + 1]
        except Exception:
            pass
    if "libs" in parts:
        try:
            idx = parts.index("libs")
            return parts[idx + 1].replace("android.", "")
        except Exception:
            pass
    return "unknown"

print("Mapping native libs to Gradle transformed artifacts (this may take a bit)...")
print("lib,abi,artifact,cache_path")

for so_path in iter_transformed_libs(transforms_root):
    lib = os.path.basename(so_path)
    if lib not in libs:
        continue
    artifact = extract_artifact(so_path)
    abi = extract_abi(so_path)
    print(f"{lib},{abi},{artifact},{so_path}")
PY
