import { ChatMessage } from '../types/assistant';

export interface AssistantResponse {
  text: string;
  error?: string;
}

export async function sendPromptToAssistant(
  prompt: string,
  history: ChatMessage[],
  model: string = 'gemini-3.8-flash',
  customApiKey?: string
): Promise<AssistantResponse> {
  try {
    const formattedHistory = history.slice(-6).map((msg) => ({
      role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: msg.text,
    }));

    const response = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        history: formattedHistory,
        model,
        apiKey: customApiKey || undefined,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return { text: data.text || 'Core online, but no output received.' };
  } catch (err: any) {
    return {
      text: '',
      error: err.message || 'Failed to establish link with AI core.',
    };
  }
}

export async function checkAssistantStatus(): Promise<{ online: boolean; hasKey: boolean; defaultModel: string }> {
  try {
    const res = await fetch('/api/assistant/status');
    if (!res.ok) throw new Error('Status endpoint unavailable');
    const data = await res.json();
    return {
      online: data.status === 'online',
      hasKey: data.hasServerKey ?? true,
      defaultModel: data.defaultModel || 'gemini-3.8-flash',
    };
  } catch {
    return { online: true, hasKey: true, defaultModel: 'gemini-3.8-flash' };
  }
}
