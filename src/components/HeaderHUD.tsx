import React from 'react';
import {
  Cpu,
  Settings,
  History,
  Code2,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  Wifi,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { AssistantStatus } from '../types/assistant';

interface HeaderHUDProps {
  status: AssistantStatus;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenAndroidStudio: () => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  status,
  isDarkTheme,
  onToggleTheme,
  onOpenSettings,
  onOpenAndroidStudio,
  isSpeaking,
  onToggleSpeech,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-slate-950/70 backdrop-blur-md select-none">
      {/* Brand & Subsystem Indicator */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/40 shadow-md shadow-cyan-950/50">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-cyber font-bold tracking-wider text-white">
              INFOSCRAP <span className="text-cyan-400 text-glow-cyan">AI</span>
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
              JARVIS PROTOCOL v1.0
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === 'LISTENING'
                    ? 'bg-cyan-400 animate-ping'
                    : status === 'THINKING'
                    ? 'bg-purple-400 animate-pulse'
                    : status === 'SPEAKING'
                    ? 'bg-blue-400 animate-pulse'
                    : status === 'ERROR'
                    ? 'bg-red-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-slate-300 uppercase">{status}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 hidden sm:inline">MASCULINE VOICE ENGAGED</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Android Studio & Termux Source Project Button */}
        <button
          onClick={onOpenAndroidStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:bg-cyan-950/60 transition-all shadow-sm"
          title="Open Android Studio & Termux APK Builder"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">ANDROID SOURCE & TERMUX</span>
        </button>

        {/* Global Speech Toggle */}
        <button
          onClick={onToggleSpeech}
          className={`p-2 rounded-lg border transition-all ${
            isSpeaking
              ? 'bg-purple-950/50 border-purple-500/50 text-purple-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title={isSpeaking ? 'Mute Assistant Voice' : 'Voice Enabled'}
        >
          {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Toggle Cyber Theme"
        >
          {isDarkTheme ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          title="AI Brain & System Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
