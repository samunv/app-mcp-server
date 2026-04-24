import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

let client: Client | null = null;

export async function getMcpClient() {
  if (client) return client;

  client = new Client({ name: "real-estate-client", version: "1.0" });

  const transport = new SSEClientTransport(
    new URL(process.env.MCP_SERVER_URL + "/sse")
  );

  await client.connect(transport);
  return client;
}

export async function getTools() {
  const c = await getMcpClient();
  const { tools } = await c.listTools();
  return tools;
}

export async function callTool(name: string, args: Record<string, unknown>) {
  const c = await getMcpClient();
  const result = await c.callTool({ name, arguments: args });
  return result;
}