import { defineConfig, type Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

const STATE_DIR = path.resolve(__dirname, 'state');
const AGENTS_DIR = path.join(STATE_DIR, 'agents');

/**
 * Vite plugin that serves agent state files via HTTP API.
 *
 * Endpoints:
 *   GET  /api/state/world         → returns state/world.json
 *   GET  /api/state/chat          → returns state/chat.json
 *   GET  /api/state/agents        → returns list of agent files
 *   GET  /api/state/agents/:id    → returns state/agents/:id.json
 *   PUT  /api/state/agents/:id    → writes renderer fields to agent file
 *   POST /api/state/chat          → appends a message to chat.json
 */
function stateApiPlugin(): Plugin {
  return {
    name: 'sandybox-state-api',
    configureServer(server) {
      // Ensure directories exist
      if (!fs.existsSync(AGENTS_DIR)) {
        fs.mkdirSync(AGENTS_DIR, { recursive: true });
      }

      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/state')) return next();

        // CORS headers for external agent access
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        const url = req.url.replace(/\?.*$/, ''); // strip query params

        // GET /api/state/world
        if (url === '/api/state/world' && req.method === 'GET') {
          return serveJsonFile(path.join(STATE_DIR, 'world.json'), res);
        }

        // GET /api/state/chat
        if (url === '/api/state/chat' && req.method === 'GET') {
          return serveJsonFile(path.join(STATE_DIR, 'chat.json'), res);
        }

        // POST /api/state/chat — renderer appends a chat message
        if (url === '/api/state/chat' && req.method === 'POST') {
          return readBody(req, (body) => {
            try {
              const message = JSON.parse(body);
              const chatPath = path.join(STATE_DIR, 'chat.json');
              let chat = { messages: [] as any[] };
              if (fs.existsSync(chatPath)) {
                chat = JSON.parse(fs.readFileSync(chatPath, 'utf-8'));
              }
              chat.messages.push(message);
              // Keep last 50 messages
              if (chat.messages.length > 50) {
                chat.messages = chat.messages.slice(-50);
              }
              fs.writeFileSync(chatPath, JSON.stringify(chat, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok' }));
            } catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
        }

        // GET /api/state/agents — list all agent files
        if (url === '/api/state/agents' && req.method === 'GET') {
          try {
            const files = fs.readdirSync(AGENTS_DIR)
              .filter(f => f.endsWith('.json'))
              .map(f => {
                const data = JSON.parse(fs.readFileSync(path.join(AGENTS_DIR, f), 'utf-8'));
                return data;
              });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(files));
          } catch {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('[]');
          }
          return;
        }

        // GET/PUT /api/state/agents/:id
        const agentMatch = url.match(/^\/api\/state\/agents\/([a-zA-Z0-9_-]+)$/);
        if (agentMatch) {
          const agentId = agentMatch[1];
          const filePath = path.join(AGENTS_DIR, `${agentId}.json`);

          if (req.method === 'GET') {
            return serveJsonFile(filePath, res);
          }

          if (req.method === 'PUT') {
            return readBody(req, (body) => {
              try {
                const updates = JSON.parse(body);
                let existing: any = {};
                if (fs.existsSync(filePath)) {
                  existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                }
                // Merge: renderer fields overwrite, agent fields preserved
                const merged = { ...existing, ...updates };
                fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(merged));
              } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
          }
        }

        // Not matched
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      });
    },
  };
}

function serveJsonFile(filePath: string, res: any) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'File not found' }));
  }
}

function readBody(req: any, callback: (body: string) => void) {
  let body = '';
  req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
  req.on('end', () => callback(body));
}

export default defineConfig({
  plugins: [stateApiPlugin()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
