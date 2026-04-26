import 'dotenv/config';
import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './server';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createMcpServer();
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
  await server.close();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'real-estate-mcp-server' });
});

app.listen(PORT, () => {
  console.log(`MCP Server en http://localhost:${PORT}`);
});