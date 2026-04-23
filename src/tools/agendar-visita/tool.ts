import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { agendarVisita } from './service';

export function registerAgendarVisita(server: McpServer): void {
  server.tool(
    'agendar_visita',
    'Agenda una visita a una propiedad en Google Calendar e invita al cliente por email.',
    {
      propiedad_id: z.string().describe('ID de la propiedad a visitar'),
      propiedad_titulo: z.string().describe('Nombre/título de la propiedad'),
      propiedad_direccion: z.string().describe('Dirección completa de la propiedad'),
      cliente_nombre: z.string().describe('Nombre completo del cliente'),
      cliente_email: z.string().email().describe('Email del cliente'),
      fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Fecha en formato YYYY-MM-DD'),
      hora: z.string().regex(/^\d{2}:\d{2}$/).describe('Hora en formato HH:MM (24h)'),
      duracion_minutos: z.number().default(60).describe('Duración de la visita en minutos'),
    },
    async (datos) => {
      const resultado = await agendarVisita(datos);

      return {
        content: [
          {
            type: 'text',
            text:
              `✅ Visita agendada correctamente\n\n` +
              `📅 Fecha y hora: ${resultado.fecha_hora}\n` +
              `🏠 Propiedad: ${datos.propiedad_titulo}\n` +
              `📍 Dirección: ${datos.propiedad_direccion}\n` +
              `👤 Cliente: ${datos.cliente_nombre} (${datos.cliente_email})\n` +
              `🔗 Ver en calendario: ${resultado.enlace_calendario}\n` +
              `🆔 ID del evento: ${resultado.evento_id}`,
          },
        ],
      };
    }
  );
}
