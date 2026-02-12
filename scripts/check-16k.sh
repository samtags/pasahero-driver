#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

AAB_PATH="$ROOT_DIR/android/app/build/outputs/bundle/release/app-release.aab"
TEMP_DIR=""

cleanup() {
  if [[ -n "$TEMP_DIR" && -d "$TEMP_DIR" ]]; then
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT

resolve_readelf() {
  if command -v readelf >/dev/null 2>&1; then
    echo "readelf"
    return 0
  fi
  if command -v llvm-readelf >/dev/null 2>&1; then
    echo "llvm-readelf"
    return 0
  fi

  local sdk_root="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Library/Android/sdk}}"
  local ndk_root="$sdk_root/ndk"
  if [[ -d "$ndk_root" ]]; then
    local readelf_path
    readelf_path="$(find "$ndk_root" -type f -path "*/toolchains/llvm/prebuilt/*/bin/llvm-readelf" 2>/dev/null | head -n 1 || true)"
    if [[ -n "$readelf_path" ]]; then
      echo "$readelf_path"
      return 0
    fi
  fi

  return 1
}

READELF_BIN="$(resolve_readelf || true)"
if [[ -z "${READELF_BIN}" ]]; then
  echo "error: readelf not found. Install binutils or ensure NDK llvm-readelf is available." >&2
  exit 2
fi

declare -a SEARCH_PATHS=()
if [[ $# -gt 0 ]]; then
  SEARCH_PATHS=("$@")
else
  if [[ -f "$AAB_PATH" ]]; then
    TEMP_DIR="$(mktemp -d)"
    unzip -qq "$AAB_PATH" -d "$TEMP_DIR"
    SEARCH_PATHS+=("$TEMP_DIR/base/lib")
  else
    SEARCH_PATHS+=("$ROOT_DIR/android/app/build/intermediates/merged_native_libs/release/mergeReleaseNativeLibs/out/lib")
    SEARCH_PATHS+=("$ROOT_DIR/android/app/build/outputs/bundle/release")
    SEARCH_PATHS+=("$ROOT_DIR/android/app/build/outputs/apk/release")
  fi
fi

declare -a SO_FILES=()
for path in "${SEARCH_PATHS[@]}"; do
  if [[ -d "$path" ]]; then
    while IFS= read -r -d '' file; do
      SO_FILES+=("$file")
    done < <(find "$path" -type f -name "*.so" -print0)
  fi
done

if [[ ${#SO_FILES[@]} -eq 0 ]]; then
  echo "no .so files found in:"
  for path in "${SEARCH_PATHS[@]}"; do
    echo "  - $path"
  done
  echo "Build a release bundle/apk first, then re-run."
  exit 1
fi

FAIL_COUNT=0
TOTAL_COUNT=0

for so in "${SO_FILES[@]}"; do
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  while IFS= read -r align; do
    # Support hex (0x...) or decimal.
    if [[ "$align" == 0x* || "$align" == 0X* ]]; then
      value=$((align))
    else
      value=$((10#$align))
    fi
    if (( value < 0x4000 )); then
      if (( FAIL_COUNT == 0 )); then
        echo "Non-16KB-aligned LOAD segments found:"
      fi
      echo "  - $so (p_align=$align)"
      FAIL_COUNT=$((FAIL_COUNT + 1))
      break
    fi
  done < <("$READELF_BIN" -lW "$so" | awk '/LOAD/ { print $NF }')
done

echo "Scanned $TOTAL_COUNT native libraries."
if (( FAIL_COUNT == 0 )); then
  echo "OK: All LOAD segments aligned to >= 0x4000 (16 KB)."
else
  echo "FAIL: $FAIL_COUNT libraries have LOAD segments aligned < 0x4000."
  exit 3
fi
