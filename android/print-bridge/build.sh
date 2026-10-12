#!/bin/sh
set -eu
cd "$(dirname "$0")"
SDK=${ANDROID_HOME:-$HOME/Library/Android/sdk}
BT=$SDK/build-tools/35.0.0
PLATFORM=$SDK/platforms/android-34/android.jar
KEYSTORE=${KEYSTORE:-$HOME/.android/debug.keystore}
rm -rf build && mkdir -p build/gen build/classes build/dex
"$BT/aidl" -I aidl -o build/gen aidl/woyou/aidlservice/jiuiv5/ICallback.aidl
"$BT/aidl" -I aidl -o build/gen aidl/woyou/aidlservice/jiuiv5/IWoyouService.aidl
"$BT/aapt2" link -o build/base.apk -I "$PLATFORM" --manifest AndroidManifest.xml
javac --release 11 -cp "$PLATFORM" -d build/classes $(find src build/gen -name '*.java')
"$BT/d8" --release --lib "$PLATFORM" --min-api 26 --output build/dex $(find build/classes -name '*.class')
(cd build/dex && zip -q ../base.apk classes.dex)
"$BT/zipalign" -f 4 build/base.apk build/aligned.apk
"$BT/apksigner" sign --ks "$KEYSTORE" --ks-pass pass:android --out build/print-bridge.apk build/aligned.apk
echo "built build/print-bridge.apk"
