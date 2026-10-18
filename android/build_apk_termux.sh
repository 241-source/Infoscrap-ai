#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# InfoScrap AI - Termux Automated APK Build Script
# Architecture: Android 8.0+ (API 26 to 34), Gradle Kotlin DSL, Jetpack Compose
# ==============================================================================

set -e

echo "[*] Initializing InfoScrap AI Termux Build Environment..."

# Update packages
pkg update -y && pkg upgrade -y

# Install dependencies: OpenJDK 17, git, wget, unzip
echo "[*] Installing OpenJDK 17 and build essentials..."
pkg install -y openjdk-17 git wget unzip

export JAVA_HOME="/data/data/com.termux/files/usr/lib/jvm/java-17-openjdk"
export PATH="$JAVA_HOME/bin:$PATH"

echo "[*] Java Version:"
java -version

# Check or install Gradle if needed
if ! command -v gradle &> /dev/null; then
    echo "[*] Installing Gradle..."
    pkg install -y gradle
fi

# Make gradlew executable if present
if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    echo "[*] Compiling Debug APK with Gradle Wrapper..."
    ./gradlew assembleDebug --stacktrace
else
    echo "[*] Compiling Debug APK with system Gradle..."
    gradle assembleDebug --stacktrace
fi

echo "=========================================================="
echo "[SUCCESS] InfoScrap AI APK built successfully!"
echo "Target APK location: app/build/outputs/apk/debug/app-debug.apk"
echo "You can install it directly with: termux-open app/build/outputs/apk/debug/app-debug.apk"
echo "=========================================================="
