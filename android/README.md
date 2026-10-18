# InfoScrap AI - Advanced Android Personal AI Assistant

InfoScrap AI is a futuristic Android voice and intelligence assistant built with **Jetpack Compose**, **Kotlin**, and **Clean Architecture (MVVM)**, inspired by JARVIS while featuring its own identity, masculine calm voice persona, multi-model engine (Google Gemini primary, OpenAI compatible, Anthropic, and local Termux/Ollama models), and Android accessibility automation services.

## Architecture
- **Language**: Kotlin 2.0
- **UI Framework**: Jetpack Compose with Material 3 & Custom Canvas Core Waveforms
- **Architecture**: MVVM + Clean Architecture + Repository Pattern
- **Min SDK**: Android 8.0 (API 26)
- **Target SDK**: Android 14 (API 34)
- **Build System**: Gradle Kotlin DSL (`build.gradle.kts`) with Version Catalog (`libs.versions.toml`)
- **Voice System**: Android `SpeechRecognizer` + `TextToSpeech` (with masculine pitch & rate adjustments, Hindi + auto-detection)
- **Device Subsystems**: Android `AccessibilityService` (for screen scraping and automated scrolling gestures)

## Termux Build Instructions
1. Clone or extract this folder inside Termux:
   ```bash
   chmod +x build_apk_termux.sh
   ./build_apk_termux.sh
   ```
2. The generated APK will be located at:
   `app/build/outputs/apk/debug/app-debug.apk`
3. Install on your Android device:
   ```bash
   termux-open app/build/outputs/apk/debug/app-debug.apk
   ```

## Android Studio Build
1. Open this directory (`/android`) in Android Studio.
2. Allow Gradle sync to complete.
3. Select `app` and click **Run** or `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
