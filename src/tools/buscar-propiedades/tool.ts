import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { buscarPropiedades } from './service';

export function registerBuscarPropiedades(server: McpServer): void {
  server.registerTool(
    'buscar_propiedades',
    {
      description: 'Busca propiedades inmobiliarias en venta. Usa datos de Idealista o mock realista si no hay API key.',
      inputSchema: {
        ciudad: z.string().describe('Ciudad donde buscar (ej: Madrid, Barcelona)'),
        precio_max: z.number().optional().describe('Precio máximo en euros'),
        habitaciones: z.number().optional().describe('Número exacto de habitaciones'),
        metros_min: z.number().optional().describe('Superficie mínima en m²'),
      },
    },
    async ({ ciudad, precio_max, habitaciones, metros_min }) => {
      const propiedades = await buscarPropiedades({ ciudad, precio_max, habitaciones, metros_min });

      if (propiedades.length === 0) {
        return {
          content: [
            { type: 'text', text: `No se encontraron propiedades en ${ciudad} con los filtros indicados.` },
          ],
        };
      }

      const resumen = propiedades
        .map(
          (p) =>
            `🏠 [${p.id}] ${p.titulo}\n` +
            `   Precio: ${p.precio.toLocaleString('es-ES')} € | ${p.habitaciones} hab | ${p.metros} m²\n` +
            `   ${p.planta} planta | ${p.antiguedad} años de antigüedad\n` +
            `   📍 ${p.direccion}, ${p.zona}, ${p.ciudad}\n` +
            `   ${p.descripcion}\n` +
            `   🔗 ${p.url}`
        )
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Se encontraron ${propiedades.length} propiedades en ${ciudad}:\n\n${resumen}`,
          },
        ],
      };
    }
  );
}
