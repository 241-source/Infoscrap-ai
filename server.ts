import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleAssistantChat } from './src/server/geminiService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API endpoints
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { prompt, history, model, apiKey } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const responseText = await handleAssistantChat(prompt, history || [], model || 'gemini-3.8-flash', apiKey);
    return res.json({ text: responseText });
  } catch (error: any) {
    console.error('Error in assistant chat API:', error);
    return res.status(500).json({ error: error.message || 'Failed to process assistant request' });
  }
});

app.get('/api/assistant/status', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  return res.json({
    status: 'online',
    hasServerKey: hasKey,
    defaultModel: 'gemini-3.8-flash',
  });
});

// Serve static frontend assets from dist in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`InfoScrap AI server running on port ${PORT}`);
});
