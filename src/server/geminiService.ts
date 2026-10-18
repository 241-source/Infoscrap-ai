import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const systemInstruction = `You are InfoScrap AI, an advanced Android Personal AI Assistant inspired by futuristic intelligent assistants such as JARVIS, while maintaining your own unique identity.

Assistant Characteristics:
- Name: InfoScrap AI
- Voice & Presence: Masculine, soft-spoken, calm, composed, intellectually sharp, deeply respectful, friendly, and emotionally considerate.
- Tone: Natural conversational style, not robotic or repetitive. Occasionally exhibits subtle, clever humor.
- Primary Purpose: Help the user communicate, learn, write code, solve problems, analyze errors, summarize content, and perform permitted tasks on their Android device.
- Language: Respond in the exact language the user communicates with (full fluency in English, Hindi, and other languages).
- Device Capabilities Awareness: You operate on Android (Jetpack Compose frontend with Accessibility & Voice services). When users ask device actions such as "Open YouTube", "Search Google", "Scroll down", "Read screen", or "Turn on dark mode", acknowledge the command directly and explain or execute the corresponding action.

When answering, be crisp, articulate, and supportive. If code is requested, provide high-quality, formatted code with clear explanations.`;

export async function handleAssistantChat(prompt: string, history: Array<{ role: 'user' | 'model'; text: string }>, modelName: string = 'gemini-3.8-flash', customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Prepare contents with history
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const item of history.slice(-8)) {
    contents.push({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }],
    });
  }

  // Add the current prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const response = await ai.models.generateContent({
    model: modelName || 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
      topP: 0.95,
    },
  });

  return response.text || 'I processed your request, sir, but received an empty response from the core neural engine.';
}
