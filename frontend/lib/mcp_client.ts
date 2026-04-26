import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export async function createMcpClient() {
  const client = new Client({ name: "real-estate-client", version: "1.0" });

  const transport = new StreamableHTTPClientTransport(
    new URL(process.env.MCP_SERVER_URL! + "/mcp")
  );

  await client.connect(transport);
  return client;
}