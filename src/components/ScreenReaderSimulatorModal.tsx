import React, { useState } from 'react';
import {
  X,
  ScanText,
  Smartphone,
  Eye,
  CheckCircle,
  FileCode,
  AlertOctagon,
  Video,
  Settings as SettingsIcon,
  Play
} from 'lucide-react';

interface ScreenReaderSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReadScreen: (screenContent: string) => void;
}

export const ScreenReaderSimulatorModal: React.FC<ScreenReaderSimulatorModalProps> = ({
  isOpen,
  onClose,
  onReadScreen,
}) => {
  const sampleScreens = [
    {
      title: 'Android Crash StackTrace',
      icon: <AlertOctagon className="w-4 h-4 text-red-400" />,
      content: `FATAL EXCEPTION: main
Process: com.example.app, PID: 14892
java.lang.NullPointerException: Attempt to invoke virtual method 'void android.widget.TextView.setText(java.lang.CharSequence)' on a null object reference
    at com.example.app.ui.MainActivity.updateUserStatus(MainActivity.kt:84)
    at com.example.app.ui.MainActivity.onCreate(MainActivity.kt:32)
    at android.app.Activity.performCreate(Activity.java:8051)
    at android.app.Instrumentation.callActivityOnCreate(Instrumentation.java:1334)`,
    },
    {
      title: 'Kotlin Coroutine Code View',
      icon: <FileCode className="w-4 h-4 text-emerald-400" />,
      content: `package com.infoscrap.ai.data
import kotlinx.coroutines.flow.*

class AssistantRepository {
    private val _state = MutableStateFlow<State>(State.Idle)
    val state: StateFlow<State> = _state.asStateFlow()

    suspend fun queryNeuralCore(prompt: String): Flow<Chunk> = flow {
        emit(Chunk.Starting)
        // Stream chunks from Gemini API
    }
}`,
    },
    {
      title: 'YouTube Android Player Screen',
      icon: <Video className="w-4 h-4 text-rose-400" />,
      content: `[YouTube App Active]
Video Title: Building Autonomous AI Voice Agents in Jetpack Compose
Channel: Modern Android Engineering
Views: 142K views • 2 days ago
Like button: 12,490 • Share button • Download button
Comments (1,240):
- user_tech: "The circular waveform animation matches JARVIS perfectly!"`,
    },
    {
      title: 'Device Settings Screen',
      icon: <SettingsIcon className="w-4 h-4 text-cyan-400" />,
      content: `[Android 14 System Settings]
- Wi-Fi: Connected to 'Cyber_HQ_5G' (Signal: Excellent)
- Battery: 88% - More than 14 hours remaining
- Accessibility: InfoScrap AI Service is [ACTIVE]
- Storage: 128 GB Total (42 GB Used)
- Dark Mode: ON`,
    },
  ];

  const [selectedScreen, setSelectedScreen] = useState(sampleScreens[0].content);
  const [customText, setCustomText] = useState(sampleScreens[0].content);

  if (!isOpen) return null;

  const handleExecute = () => {
    onReadScreen(customText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ScanText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-cyber tracking-wider text-cyan-300 font-bold">
              ANDROID ACCESSIBILITY SCREEN READER SIMULATOR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin">
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
            In Android, <span className="font-semibold text-cyan-300">InfoScrapAccessibilityService</span> traverses active UI windows, extracts AccessibilityNodeInfo elements, and feeds them into InfoScrap AI to read, translate, or debug screen contents on voice command ("Read the text on my screen").
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-2">
              Select Simulated Android Screen:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sampleScreens.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedScreen(sample.content);
                    setCustomText(sample.content);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    customText === sample.content
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                      : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {sample.icon}
                  <span className="text-xs font-medium truncate">{sample.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              Live Screen Content Buffer (Node Text Tree):
            </label>
            <textarea
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-emerald-300 focus:outline-none focus:border-cyan-400 scrollbar-thin"
              placeholder="Paste or type simulated on-screen text..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            AccessibilityService: Bound & Ready
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Eye className="w-4 h-4" />
              Analyze Screen with InfoScrap AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
