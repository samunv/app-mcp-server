import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { valorarInmueble } from './calculator';

export function registerValorarInmueble(server: McpServer): void {
  server.tool(
    'valorar_inmueble',
    'Estima el precio de mercado de un inmueble basándose en zona, m², antigüedad, planta y estado. Devuelve precio estimado con horquilla y los factores aplicados.',
    {
      ciudad: z.string().describe('Ciudad del inmueble (ej: Madrid, Barcelona, Valencia)'),
      zona: z.string().describe('Barrio o zona (ej: Chamberí, Malasaña, Eixample)'),
      metros_cuadrados: z.number().describe('Superficie útil en m²'),
      antiguedad_anios: z.number().describe('Antigüedad del edificio en años'),
      planta: z.number().describe('Número de planta (0 = bajo, -1 = sótano, 1 = primera, etc.)'),
      tiene_ascensor: z.boolean().default(true).describe('Si el edificio tiene ascensor'),
      tiene_terraza: z.boolean().default(false).describe('Si la vivienda tiene terraza o balcón'),
      estado: z
        .enum(['a_reformar', 'buen_estado', 'reformado'])
        .default('buen_estado')
        .describe('Estado del inmueble'),
    },
    async (datos) => {
      const r = valorarInmueble(datos);

      const factoresTexto = r.factores_aplicados.map((f) => `   • ${f}`).join('\n');

      return {
        content: [
          {
            type: 'text',
            text:
              `🏷️ Valoración estimada del inmueble\n\n` +
              `📍 ${datos.zona}, ${datos.ciudad} | ${datos.metros_cuadrados} m² | ` +
              `${datos.antiguedad_anios} años | Planta ${datos.planta === 0 ? 'baja' : datos.planta + 'ª'}\n\n` +
              `─────────────────────────────────────\n` +
              `💶 Precio estimado:   ${r.precio_estimado.toLocaleString('es-ES')} €\n` +
              `📉 Horquilla baja:   ${r.precio_min.toLocaleString('es-ES')} €\n` +
              `📈 Horquilla alta:   ${r.precio_max.toLocaleString('es-ES')} €\n` +
              `📐 Precio por m²:    ${r.precio_por_m2.toLocaleString('es-ES')} €/m²\n` +
              `─────────────────────────────────────\n\n` +
              `🔍 Factores aplicados:\n${factoresTexto}\n\n` +
              `⚠️ Esta valoración es orientativa. Para una tasación oficial se requiere visita presencial.`,
          },
        ],
      };
    }
  );
}
