import React, { useState } from 'react';
import {
  X,
  Key,
  Cpu,
  Volume2,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Server,
  Zap,
  Terminal
} from 'lucide-react';
import { AiSettings, ProviderType } from '../types/assistant';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AiSettings;
  onSaveSettings: (newSettings: AiSettings) => void;
  onTestConnection: (provider: ProviderType) => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTestConnection,
}) => {
  const [formData, setFormData] = useState<AiSettings>({ ...settings });
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [testingStatus, setTestingStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'failed'>>({});
  const [activeTab, setActiveTab] = useState<'brain' | 'voice' | 'providers' | 'security'>('brain');

  if (!isOpen) return null;

  const handleTest = async (provider: ProviderType) => {
    setTestingStatus((prev) => ({ ...prev, [provider]: 'testing' }));
    try {
      const ok = await onTestConnection(provider);
      setTestingStatus((prev) => ({ ...prev, [provider]: ok ? 'success' : 'failed' }));
    } catch {
      setTestingStatus((prev) => ({ ...prev, [provider]: 'failed' }));
    }
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-cyber tracking-wider text-cyan-300 font-bold">
              SYSTEM & NEURAL CONFIGURATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2">
          {[
            { id: 'brain', label: 'Gemini Brain', icon: <Zap className="w-4 h-4" /> },
            { id: 'voice', label: 'Voice & Persona', icon: <Volume2 className="w-4 h-4" /> },
            { id: 'providers', label: 'Multi-Model', icon: <Layers className="w-4 h-4" /> },
            { id: 'security', label: 'Security & Memory', icon: <Shield className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-mono font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {activeTab === 'brain' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
                <span className="font-semibold text-cyan-300">Core Engine:</span> Google Gemini handles reasoning, voice command recognition, Android task decomposition, and code generation.
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Gemini Model Selection
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tag: 'Fast / Recommended' },
                    { id: 'gemini-4-argon', name: 'Gemini 4 Argon', tag: 'Complex STEM / Code' },
                    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', tag: 'Ultra-low Latency' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, geminiModel: m.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.geminiModel === m.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-950/50'
                          : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-medium text-xs text-white">{m.name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{m.tag}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    Optional Custom Gemini API Key
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Auto-injected via Server Secrets
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={formData.geminiKey}
                    onChange={(e) => setFormData({ ...formData, geminiKey: e.target.value })}
                    placeholder="Auto-injected by AI Studio (Or enter custom key)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-20"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank to use the pre-configured server environment key. Client keys can be saved for local Android testing.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleTest('GEMINI')}
                  disabled={testingStatus['GEMINI'] === 'testing'}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {testingStatus['GEMINI'] === 'testing' && <span className="animate-spin">⚙</span>}
                  {testingStatus['GEMINI'] === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {testingStatus['GEMINI'] === 'failed' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  Test Gemini Neural Link
                </button>
                {testingStatus['GEMINI'] === 'success' && (
                  <span className="text-xs text-emerald-400 font-mono">Status: Connected (200 OK)</span>
                )}
                {testingStatus['GEMINI'] === 'failed' && (
                  <span className="text-xs text-red-400 font-mono">Status: Link Failed</span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                InfoScrap AI uses a masculine, soft-spoken persona inspired by personal intelligent assistants like JARVIS.
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Voice Pitch Calibration (Masculine Depth)</span>
                    <span className="text-cyan-400 font-bold">{formData.voicePitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={formData.voicePitch}
                    onChange={(e) => setFormData({ ...formData, voicePitch: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Deeper (0.50)</span>
                    <span>JARVIS Default (0.85)</span>
                    <span>Higher (1.50)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Speech Cadence Rate (Soft-Spoken Pacing)</span>
                    <span className="text-cyan-400 font-bold">{formData.voiceSpeed.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.05"
                    value={formData.voiceSpeed}
                    onChange={(e) => setFormData({ ...formData, voiceSpeed: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Calm (0.75)</span>
                    <span>Balanced (0.95)</span>
                    <span>Rapid (1.40)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div>
                    <div className="text-xs font-mono text-white">Auto-Speak Responses</div>
                    <div className="text-[11px] text-slate-400">Speak generated answers immediately upon completion</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoSpeak}
                    onChange={(e) => setFormData({ ...formData, autoSpeak: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xs font-mono text-white mb-1">Language Recognition & Hindi Support</div>
                  <div className="text-[11px] text-slate-400">
                    Automatic multi-lingual detection is active. If you address InfoScrap in Hindi ("नमस्ते InfoScrap", "यह कोड समझाओ"), it automatically formulates responses and speech in Hindi.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2">
                  Active Multi-Model Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'GEMINI', name: 'Google Gemini (Primary)', desc: 'Official API v1beta / Flash 3.8' },
                    { id: 'OPENAI', name: 'OpenAI Compatible', desc: 'GPT-4o / Compatible endpoints' },
                    { id: 'ANTHROPIC', name: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet adapter' },
                    { id: 'LOCAL_OLLAMA', name: 'Local Termux / Ollama', desc: '127.0.0.1:11434 / Llama 3' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, activeProvider: p.id as ProviderType })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.activeProvider === p.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                          : 'border-slate-800 bg-slate-950/50 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {formData.activeProvider === 'LOCAL_OLLAMA' && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <Terminal className="w-4 h-4" />
                    Local Android Termux / Ollama Configuration
                  </div>
                  <input
                    type="text"
                    value={formData.localOllamaUrl}
                    onChange={(e) => setFormData({ ...formData, localOllamaUrl: e.target.value })}
                    placeholder="http://127.0.0.1:11434"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                  />
                  <p className="text-[11px] text-slate-400">
                    To run locally in Termux: Install `ollama` or compile `llama.cpp`, and bind to `127.0.0.1:11434`.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div>
                  <div className="text-xs font-mono text-white">Persistent Memory Protocol</div>
                  <div className="text-[11px] text-slate-400">
                    Retain past conversation context to answer follow-up inquiries
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.memoryEnabled}
                  onChange={(e) => setFormData({ ...formData, memoryEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold">
                  <Shield className="w-4 h-4" />
                  Cybersecurity Notice
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Per Android cybersecurity best practices, never bake raw API keys into APK assets or the Android Manifest. InfoScrap AI encrypts local keys inside Android EncryptedSharedPreferences / Jetpack DataStore and proxies calls securely.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <span className="text-[11px] font-mono text-slate-500">
            BUILD 1.0.0 • ANDROID API 26-34
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs font-mono transition-all shadow-lg shadow-cyan-500/20"
            >
              Apply Configurations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
