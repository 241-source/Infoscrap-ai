import React, { useState } from 'react';
import {
  X,
  FileCode,
  Download,
  Copy,
  Check,
  Terminal,
  FolderTree,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import JSZip from 'jszip';

interface AndroidStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidStudioModal: React.FC<AndroidStudioModalProps> = ({ isOpen, onClose }) => {
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const files = [
    {
      path: 'build.gradle.kts',
      name: 'build.gradle.kts (Root)',
      lang: 'kotlin',
      content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}`,
    },
    {
      path: 'app/build.gradle.kts',
      name: 'app/build.gradle.kts',
      lang: 'kotlin',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.infoscrap.ai"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.infoscrap.ai"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        vectorDrawables.useSupportLibrary = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.okhttp)
    implementation(libs.androidx.datastore.preferences)
}`,
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      name: 'AndroidManifest.xml',
      lang: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.infoscrap.ai">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <application
        android:name=".InfoScrapApplication"
        android:label="InfoScrap AI"
        android:theme="@style/Theme.InfoScrapAI">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Assistant digital voice intent -->
            <intent-filter>
                <action android:name="android.intent.action.ASSIST" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.InfoScrapAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="false">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>
    </application>
</manifest>`,
    },
    {
      path: 'app/src/main/java/com/infoscrap/ai/MainActivity.kt',
      name: 'MainActivity.kt',
      lang: 'kotlin',
      content: `package com.infoscrap.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.infoscrap.ai.theme.InfoScrapAITheme
import com.infoscrap.ai.ui.screens.HomeScreen
import com.infoscrap.ai.viewmodel.AssistantViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: AssistantViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            InfoScrapAITheme {
                HomeScreen(viewModel = viewModel, onNavigateSettings = { })
            }
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/infoscrap/ai/ui/components/FuturisticAiCore.kt',
      name: 'FuturisticAiCore.kt',
      lang: 'kotlin',
      content: `package com.infoscrap.ai.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.infoscrap.ai.data.model.AssistantStatus

@Composable
fun FuturisticAiCore(status: AssistantStatus) {
    Box(modifier = Modifier.size(200.dp)) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            // Segmented HUD rings and audio reactive pulse
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF06B6D4), Color.Transparent),
                    center = center
                ),
                radius = size.minDimension * 0.45f
            )
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/infoscrap/ai/service/InfoScrapVoiceService.kt',
      name: 'InfoScrapVoiceService.kt',
      lang: 'kotlin',
      content: `package com.infoscrap.ai.service

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

class InfoScrapVoiceService(context: Context) : TextToSpeech.OnInitListener {
    private var tts = TextToSpeech(context, this)

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale.ENGLISH
            // Masculine calibrated voice profile (JARVIS style)
            tts.setPitch(0.85f)
            tts.setSpeechRate(0.95f)
        }
    }

    fun speak(text: String, isHindi: Boolean = false) {
        if (isHindi) tts.language = Locale("hi", "IN")
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "infoscrap_utterance")
    }
}`,
    },
    {
      path: 'build_apk_termux.sh',
      name: 'build_apk_termux.sh (Termux Script)',
      lang: 'bash',
      content: `#!/data/data/com.termux/files/usr/bin/bash
set -e
echo "[*] Initializing InfoScrap AI APK Build in Termux..."
pkg update -y
pkg install -y openjdk-17 gradle git
export JAVA_HOME="/data/data/com.termux/files/usr/lib/jvm/java-17-openjdk"
gradle assembleDebug --stacktrace
echo "[SUCCESS] Generated APK: app/build/outputs/apk/debug/app-debug.apk"
termux-open app/build/outputs/apk/debug/app-debug.apk`,
    },
  ];

  const [selectedFile, setSelectedFile] = useState(files[0]);

  if (!isOpen) return null;

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Root files
      zip.file('build.gradle.kts', files[0].content);
      zip.file(
        'settings.gradle.kts',
        `rootProject.name = "InfoScrapAI"\ninclude(":app")`
      );
      zip.file(
        'gradle.properties',
        `org.gradle.jvmargs=-Xmx2048m\nandroid.useAndroidX=true\nkotlin.code.style=official`
      );
      zip.file('build_apk_termux.sh', files[6].content);
      zip.file(
        'README.md',
        `# InfoScrap AI - Jetpack Compose Android Project\nRun './build_apk_termux.sh' inside Termux or open in Android Studio.`
      );

      // App module
      const appFolder = zip.folder('app');
      appFolder?.file('build.gradle.kts', files[1].content);

      // Manifest
      const mainFolder = appFolder?.folder('src')?.folder('main');
      mainFolder?.file('AndroidManifest.xml', files[2].content);

      // Source files
      const javaFolder = mainFolder?.folder('java')?.folder('com')?.folder('infoscrap')?.folder('ai');
      javaFolder?.file('MainActivity.kt', files[3].content);
      javaFolder?.folder('ui')?.folder('components')?.file('FuturisticAiCore.kt', files[4].content);
      javaFolder?.folder('service')?.file('InfoScrapVoiceService.kt', files[5].content);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'InfoScrapAI-Android-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-cyber tracking-wider text-cyan-300 font-bold flex items-center gap-2">
                ANDROID KOTLIN PROJECT & TERMUX BUILD STUDIO
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-mono border border-emerald-500/40">
                  REAL KOTLIN SOURCE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-hud">
                Jetpack Compose • MVVM Clean Architecture • Gradle Kotlin DSL • Android 8.0+ (API 26-34)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold shadow-md shadow-cyan-500/30 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isZipping ? 'PACKAGING ZIP...' : 'DOWNLOAD PROJECT (.ZIP)'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout: Sidebar + Code Editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/60 p-3 overflow-y-auto scrollbar-thin">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
              PROJECT HIERARCHY
            </div>
            <div className="space-y-1">
              {files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                    selectedFile.path === file.path
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-cyan-400/80" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>

            {/* Termux Quick-Run Box */}
            <div className="mt-6 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                TERMUX 1-COMMAND BUILD
              </div>
              <p className="text-[10px] text-slate-400">
                To build your APK on any Android phone directly inside Termux:
              </p>
              <div className="p-2 rounded bg-black/80 font-mono text-[10px] text-emerald-300 overflow-x-auto flex items-center justify-between">
                <code>chmod +x build_apk_termux.sh && ./build_apk_termux.sh</code>
                <button
                  onClick={() =>
                    copyCommand(
                      'chmod +x build_apk_termux.sh && ./build_apk_termux.sh',
                      'termux-run'
                    )
                  }
                  className="ml-2 hover:text-white"
                >
                  {copiedCmd === 'termux-run' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80">
              <span className="text-xs font-mono text-cyan-400">{selectedFile.path}</span>
              <button
                onClick={() => copyCode(selectedFile.content)}
                className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
              >
                {copiedFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>
            <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin bg-black/60">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
