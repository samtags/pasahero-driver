# Pasahero Driver

## Android Release Smoke Test

Build a release APK:

```bash
./android/gradlew -p android assembleRelease
```

Install and launch from CLI:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.pasahero.driver/.MainActivity
```

## Debug Splash-Then-Close on Release APK

Use this workflow to catch native startup crashes after dependency changes.

```bash
adb logcat -c
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am force-stop com.pasahero.driver
adb shell am start -n com.pasahero.driver/.MainActivity
adb logcat -b crash -d
```

Optional process/foreground check:

```bash
adb shell pidof com.pasahero.driver
adb shell dumpsys activity activities | rg "ResumedActivity|topResumedActivity|com\\.pasahero\\.driver"
```

## Recommended Dependency-Change Workflow

When installing/updating native packages:

```bash
yarn install
yarn verify:native-patches
./android/gradlew -p android assembleRelease
adb logcat -c
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.pasahero.driver/.MainActivity
adb logcat -b crash -d
```
