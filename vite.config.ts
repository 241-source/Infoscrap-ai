import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleAssistantChat } from './src/server/geminiService.ts';

function assistantApiPlugin(): Plugin {
  return {
    name: 'assistant-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/assistant/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { prompt, history, model, apiKey } = data;

            if (!prompt) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Prompt is required' }));
              return;
            }

            const responseText = await handleAssistantChat(prompt, history || [], model || 'gemini-3.8-flash', apiKey);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: responseText }));
          } catch (error: any) {
            console.error('Error in assistant chat API:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Failed to process assistant request' }));
          }
        });
      });

      server.middlewares.use('/api/assistant/status', (_req, res) => {
        const hasKey = Boolean(process.env.GEMINI_API_KEY);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          status: 'online', 
          hasServerKey: hasKey, 
          defaultModel: 'gemini-3.8-flash' 
        }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), assistantApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
