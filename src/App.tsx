/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  Command,
  Smartphone,
  ScanText
} from 'lucide-react';
import { AssistantStatus, ChatMessage, AiSettings, ProviderType } from './types/assistant';
import { sendPromptToAssistant, checkAssistantStatus } from './services/geminiClient';
import { voiceManager } from './services/voiceService';
import { HeaderHUD } from './components/HeaderHUD';
import { AiCoreOrb } from './components/AiCoreOrb';
import { QuickActionToolbar } from './components/QuickActionToolbar';
import { ConversationPanel } from './components/ConversationPanel';
import { SettingsModal } from './components/SettingsModal';
import { ScreenReaderSimulatorModal } from './components/ScreenReaderSimulatorModal';
import { AndroidStudioModal } from './components/AndroidStudioModal';

const DEFAULT_SETTINGS: AiSettings = {
  activeProvider: 'GEMINI',
  geminiModel: 'gemini-3.8-flash',
  geminiKey: '',
  openAiKey: '',
  openAiModel: 'gpt-4o',
  localOllamaUrl: 'http://127.0.0.1:11434',
  localModel: 'llama3.2:1b',
  voicePitch: 0.85, // Masculine, calibrated JARVIS style
  voiceSpeed: 0.95, // Soft-spoken, calm pacing
  masculineVoice: true,
  language: 'en-US',
  memoryEnabled: true,
  autoSpeak: true,
  darkTheme: true,
};

export default function App() {
  const [status, setStatus] = useState<AssistantStatus>('IDLE');
  const [settings, setSettings] = useState<AiSettings>(() => {
    const saved = localStorage.getItem('infoscrap_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Good day, sir. InfoScrap AI is online and operational. All core neural pathways and Android subsystems are calibrated. How may I be of service to you today?",
      timestamp: Date.now(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScreenReaderOpen, setIsScreenReaderOpen] = useState(false);
  const [isAndroidStudioOpen, setIsAndroidStudioOpen] = useState(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync settings
  useEffect(() => {
    localStorage.setItem('infoscrap_settings', JSON.stringify(settings));
  }, [settings]);

  // Initial speech synthesis welcome if permitted
  useEffect(() => {
    checkAssistantStatus();
  }, []);

  const triggerActionNotification = (text: string) => {
    setActionNotification(text);
    setTimeout(() => setActionNotification(null), 4000);
  };

  const handleSpeechInput = () => {
    if (status === 'LISTENING') {
      voiceManager.stopListening();
      setStatus('IDLE');
      return;
    }

    voiceManager.startListening(
      (transcript) => {
        setInputPrompt(transcript);
        processUserCommand(transcript);
      },
      (active) => {
        setStatus(active ? 'LISTENING' : 'IDLE');
      },
      settings.language
    );
  };

  const handleSpeakText = (text: string) => {
    setIsSpeaking(true);
    setStatus('SPEAKING');

    voiceManager.speak(text, {
      pitch: settings.voicePitch,
      rate: settings.voiceSpeed,
      masculine: settings.masculineVoice,
      onStart: () => {
        setIsSpeaking(true);
        setStatus('SPEAKING');
      },
      onEnd: () => {
        setIsSpeaking(false);
        setStatus('IDLE');
      },
    });
  };

  const handleStopSpeaking = () => {
    voiceManager.stopSpeaking();
    setIsSpeaking(false);
    if (status === 'SPEAKING') {
      setStatus('IDLE');
    }
  };

  const processUserCommand = async (rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt) return;

    handleStopSpeaking();

    // 1. Append User Message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputPrompt('');

    const lower = prompt.toLowerCase();

    // 2. Client-side Simulated Android Device Protocol Checks
    if (lower.includes('open youtube')) {
      triggerActionNotification('Launching YouTube App Subsystem');
      window.open('https://youtube.com', '_blank');
      const responseText = "Opening YouTube for you right now, sir. The video feed should appear on your screen.";
      respondWithAssistant(responseText, nextMessages, 'Android Intent: com.google.android.youtube');
      return;
    }

    if (lower.startsWith('search') || lower.includes('search this on google') || lower.includes('search the web')) {
      const query = prompt.replace(/^search\s+(this on google|the web for|google for|for)?\s*/i, '').trim() || 'latest artificial intelligence news';
      triggerActionNotification(`Executing Web Search: "${query}"`);
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      const responseText = `I have executed a web search for "${query}". Your results have been queried and opened, sir.`;
      respondWithAssistant(responseText, nextMessages, 'Web Search Query');
      return;
    }

    if (lower.includes('read the text on my screen') || lower.includes('read screen')) {
      setIsScreenReaderOpen(true);
      return;
    }

    if (lower.includes('scroll down')) {
      triggerActionNotification('AccessibilityService: ACTION_SCROLL_FORWARD');
      window.scrollBy({ top: 400, behavior: 'smooth' });
      const responseText = "Scrolling downward through your active viewport, sir.";
      respondWithAssistant(responseText, nextMessages, 'Accessibility Gesture: Scroll Down');
      return;
    }

    if (lower.includes('scroll up')) {
      triggerActionNotification('AccessibilityService: ACTION_SCROLL_BACKWARD');
      window.scrollBy({ top: -400, behavior: 'smooth' });
      const responseText = "Scrolling upward through your viewport, sir.";
      respondWithAssistant(responseText, nextMessages, 'Accessibility Gesture: Scroll Up');
      return;
    }

    if (lower.includes('turn on dark mode')) {
      setSettings((prev) => ({ ...prev, darkTheme: true }));
      respondWithAssistant("Dark mode engaged, sir. Contrast and low-luminescence filters are now active.", nextMessages);
      return;
    }

    if (lower.includes('turn on light mode')) {
      setSettings((prev) => ({ ...prev, darkTheme: false }));
      respondWithAssistant("Light mode activated. Luminescence increased.", nextMessages);
      return;
    }

    if (lower.includes('stop speaking')) {
      handleStopSpeaking();
      return;
    }

    // 3. AI Brain Query (Gemini or Configured Provider)
    setStatus('THINKING');

    try {
      const historyToPass = settings.memoryEnabled ? nextMessages : [];
      const res = await sendPromptToAssistant(
        prompt,
        historyToPass,
        settings.geminiModel,
        settings.geminiKey
      );

      if (res.error) {
        setStatus('ERROR');
        const errorMsg: ChatMessage = {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: `Neural error: ${res.error}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: res.text,
          timestamp: Date.now(),
          containsCode: res.text.includes('```'),
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (settings.autoSpeak) {
          handleSpeakText(res.text);
        } else {
          setStatus('IDLE');
        }
      }
    } catch (err: any) {
      setStatus('ERROR');
      const errorMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: `Subsystem error: ${err.message || 'Connection lost'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const respondWithAssistant = (
    text: string,
    currentHistory: ChatMessage[],
    actionLabel?: string
  ) => {
    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp: Date.now(),
      actionExecuted: actionLabel,
    };
    setMessages([...currentHistory, aiMsg]);
    if (settings.autoSpeak) {
      handleSpeakText(text);
    } else {
      setStatus('IDLE');
    }
  };

  const handleScreenReaderAnalysis = (screenText: string) => {
    processUserCommand(`Analyze and read this text captured from my screen by the Accessibility Service:\n\n${screenText}`);
  };

  const handleTestConnection = async (provider: ProviderType): Promise<boolean> => {
    try {
      const res = await sendPromptToAssistant('Ping neural interface', [], settings.geminiModel, settings.geminiKey);
      return Boolean(res.text && !res.error);
    } catch {
      return false;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        settings.darkTheme
          ? 'bg-[#030712] text-slate-100 bg-cyber-grid'
          : 'bg-slate-900 text-slate-100'
      }`}
    >
      {/* HUD Header */}
      <HeaderHUD
        status={status}
        isDarkTheme={settings.darkTheme}
        onToggleTheme={() => setSettings((s) => ({ ...s, darkTheme: !s.darkTheme }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAndroidStudio={() => setIsAndroidStudioOpen(true)}
        isSpeaking={isSpeaking}
        onToggleSpeech={() => {
          if (isSpeaking) handleStopSpeaking();
          else if (messages.length > 0) {
            const lastAi = [...messages].reverse().find((m) => m.sender === 'assistant');
            if (lastAi) handleSpeakText(lastAi.text);
          }
        }}
      />

      {/* Action Notification Banner */}
      {actionNotification && (
        <div className="w-full bg-cyan-950/90 border-b border-cyan-500/40 px-4 py-1.5 text-center text-xs font-mono text-cyan-300 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{actionNotification}</span>
        </div>
      )}

      {/* Main Command & Interface Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left Column: Futuristic Core & Quick Protocols (lg: 5 cols) */}
        <section className="lg:col-span-5 flex flex-col items-center justify-between space-y-6">
          {/* Animated Central Core */}
          <div className="w-full flex flex-col items-center justify-center py-2">
            <AiCoreOrb
              status={status}
              onClick={handleSpeechInput}
            />
            <p className="text-[11px] font-mono text-slate-400 mt-3 text-center">
              TAP CORE OR MIC TO SPEAK • MASCULINE JARVIS ENGINE
            </p>
          </div>

          {/* Quick Action Protocols */}
          <div className="w-full">
            <QuickActionToolbar
              disabled={status === 'THINKING'}
              onActionClick={(prompt, label) => {
                if (label === 'Read Screen') {
                  setIsScreenReaderOpen(true);
                } else {
                  processUserCommand(prompt);
                }
              }}
            />
          </div>

          {/* Device Subsystems Info Card */}
          <div className="w-full p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
                <Smartphone className="w-4 h-4" />
                ANDROID ACCESSIBILITY BRIDGE
              </span>
              <span className="text-emerald-400">STATUS: ONLINE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block">AI BRAIN:</span>
                <span className="text-white font-medium">{settings.geminiModel}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block">VOICE ENGINE:</span>
                <span className="text-white font-medium">Masculine Soft-Spoken</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setIsScreenReaderOpen(true)}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <ScanText className="w-3.5 h-3.5" />
                Launch Screen Reader Simulator
              </button>
              <button
                onClick={() => setIsAndroidStudioOpen(true)}
                className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
              >
                View Kotlin Source →
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Conversation Stream & Input Controls (lg: 7 cols) */}
        <section className="lg:col-span-7 flex flex-col h-[640px] md:h-[720px]">
          {/* Conversation Panel */}
          <div className="flex-1 min-h-0 mb-4">
            <ConversationPanel
              messages={messages}
              onSpeak={handleSpeakText}
              onStopSpeaking={handleStopSpeaking}
              isSpeaking={isSpeaking}
              onRegenerate={() => {
                const userMessages = messages.filter((m) => m.sender === 'user');
                if (userMessages.length > 0) {
                  const lastUser = userMessages[userMessages.length - 1];
                  processUserCommand(lastUser.text);
                }
              }}
              onClearHistory={() => {
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    sender: 'assistant',
                    text: 'Conversation buffer purged, sir. InfoScrap AI standing by.',
                    timestamp: Date.now(),
                  },
                ]);
              }}
            />
          </div>

          {/* Command Input Area */}
          <div className="relative rounded-2xl bg-slate-950/80 border border-cyan-500/30 p-2 shadow-xl backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processUserCommand(inputPrompt);
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Button */}
              <button
                type="button"
                onClick={handleSpeechInput}
                className={`p-3 rounded-xl transition-all shadow-md ${
                  status === 'LISTENING'
                    ? 'bg-red-500 text-white animate-pulse shadow-red-500/40'
                    : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30'
                }`}
                title="Toggle Voice Input (Speech-to-Text)"
              >
                {status === 'LISTENING' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Command InfoScrap AI (e.g., 'Open YouTube', 'Explain this code', 'Translate into Hindi')..."
                className="flex-1 px-3 py-2.5 bg-transparent font-hud text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />

              {/* Stop Generation / Speech button if active */}
              {isSpeaking && (
                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  className="p-3 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300 hover:bg-purple-900 transition-colors"
                  title="Stop Speaking"
                >
                  <VolumeX className="w-5 h-5" />
                </button>
              )}

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputPrompt.trim() || status === 'THINKING'}
                className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none"
                title="Send Command"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Interactive Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onTestConnection={handleTestConnection}
      />

      <ScreenReaderSimulatorModal
        isOpen={isScreenReaderOpen}
        onClose={() => setIsScreenReaderOpen(false)}
        onReadScreen={handleScreenReaderAnalysis}
      />

      <AndroidStudioModal
        isOpen={isAndroidStudioOpen}
        onClose={() => setIsAndroidStudioOpen(false)}
      />
    </div>
  );
}
