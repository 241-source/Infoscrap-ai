export type AssistantStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR' | 'OFFLINE';

export type ProviderType = 'GEMINI' | 'OPENAI' | 'ANTHROPIC' | 'LOCAL_OLLAMA';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  containsCode?: boolean;
  actionExecuted?: string;
}

export interface AiSettings {
  activeProvider: ProviderType;
  geminiModel: string;
  geminiKey: string;
  openAiKey: string;
  openAiModel: string;
  localOllamaUrl: string;
  localModel: string;
  voicePitch: number;
  voiceSpeed: number;
  masculineVoice: boolean;
  language: string;
  memoryEnabled: boolean;
  autoSpeak: boolean;
  darkTheme: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  category: 'system' | 'ai' | 'tool' | 'device';
}
