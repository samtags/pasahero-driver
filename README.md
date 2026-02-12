# 16 KB Page Size Upgrade TODO

- [ ] Create a backup commit or branch for the current state.
- [ ] Upgrade Expo SDK to 53 (or 54 if you want latest).
- [ ] Update all `expo-*` packages to match the chosen SDK.
- [ ] Rebuild release (`./android/gradlew -p android bundleRelease`).
- [ ] Run `scripts/check-16k.sh`.
- [ ] If RN/Hermes libs still fail, ensure the Expo SDK bump actually pulled RN 0.79+.
- [ ] Upgrade `@rnmapbox/maps` to a version that uses `*-ndk27` artifacts.
- [ ] Rebuild release and run `scripts/check-16k.sh`.
- [ ] Upgrade native modules: `react-native-reanimated`, `react-native-screens`, `react-native-webrtc`, and any other native SDKs to versions compatible with the new Expo/RN.
- [ ] Rebuild release and run `scripts/check-16k.sh` again.
- [ ] If any `.so` still fails, run `scripts/map-native-libs.sh` to map it back to its dependency.
- [ ] Bump or replace that dependency, then re‑check until all libs pass.
