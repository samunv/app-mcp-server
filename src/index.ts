import 'dotenv/config';
import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMcpServer } from './server';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Mapa de transportes activos por sessionId
const transports = new Map<string, SSEServerTransport>();

// GET /sse — el cliente MCP se conecta aquí para recibir eventos
app.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  transports.set(transport.sessionId, transport);

  const server = createMcpServer();
  await server.connect(transport);

  res.on('close', () => {
    transports.delete(transport.sessionId);
  });
});

// POST /messages — el cliente envía mensajes JSON-RPC aquí
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);

  if (!transport) {
    res.status(404).json({ error: 'Sesión no encontrada' });
    return;
  }

  await transport.handlePostMessage(req, res);
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'real-estate-mcp-server',
    sessions: transports.size,
  });
});

app.listen(PORT, () => {
  console.log(`🏠 Real Estate MCP Server en http://localhost:${PORT}`);
  console.log(`   SSE:      GET  http://localhost:${PORT}/sse`);
  console.log(`   Mensajes: POST http://localhost:${PORT}/messages`);
  console.log(`   Salud:    GET  http://localhost:${PORT}/health`);
});
