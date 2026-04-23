import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { obtenerPuntosInteres, TipoPunto } from './service';

const ICONOS: Record<TipoPunto, string> = {
  metro: '🚇',
  colegio: '🏫',
  supermercado: '🛒',
  parque: '🌳',
  hospital: '🏥',
};

export function registerObtenerPuntosInteres(server: McpServer): void {
  server.tool(
    'obtener_puntos_interes',
    'Busca puntos de interés cercanos a una dirección: metro, colegios, supermercados, parques, hospitales. Usa Google Places API o mock si no hay clave.',
    {
      direccion: z.string().describe('Dirección completa de la propiedad (ej: Calle Alonso Cano 25, Madrid)'),
      tipos: z
        .array(z.enum(['metro', 'colegio', 'supermercado', 'parque', 'hospital']))
        .default(['metro', 'colegio', 'supermercado'])
        .describe('Tipos de puntos de interés a buscar'),
      radio_metros: z.number().default(1000).describe('Radio de búsqueda en metros (por defecto 1000)'),
    },
    async ({ direccion, tipos, radio_metros }) => {
      const puntos = await obtenerPuntosInteres(direccion, tipos as TipoPunto[], radio_metros);

      if (puntos.length === 0) {
        return {
          content: [{ type: 'text', text: `No se encontraron puntos de interés cerca de: ${direccion}` }],
        };
      }

      const resumen = puntos
        .map(
          (p) =>
            `${ICONOS[p.tipo]} ${p.nombre} (${p.tipo})\n` +
            `   📍 ${p.direccion} — a ${p.distancia_metros} m\n` +
            (p.rating ? `   ⭐ ${p.rating}/5` : '')
        )
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Puntos de interés cerca de "${direccion}":\n\n${resumen}`,
          },
        ],
      };
    }
  );
}
