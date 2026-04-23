import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerBuscarPropiedades } from './tools/buscar-propiedades/tool';
import { registerObtenerPuntosInteres } from './tools/obtener-puntos-interes/tool';
import { registerAgendarVisita } from './tools/agendar-visita/tool';
import { registerEnviarFicha } from './tools/enviar-ficha/tool';
import { registerCalcularHipoteca } from './tools/calcular-hipoteca/tool';
import { registerValorarInmueble } from './tools/valorar-inmueble/tool';

/**
 * Crea y configura el servidor MCP con todas las tools registradas.
 * Se llama una vez por cada conexión SSE entrante.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'real-estate-mcp-server',
    version: '1.0.0',
  });

  registerBuscarPropiedades(server);
  registerObtenerPuntosInteres(server);
  registerAgendarVisita(server);
  registerEnviarFicha(server);
  registerCalcularHipoteca(server);
  registerValorarInmueble(server);

  return server;
}
