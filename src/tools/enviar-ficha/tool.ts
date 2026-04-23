import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { enviarFichaPropiedad } from './service';

export function registerEnviarFicha(server: McpServer): void {
  server.registerTool(
    'enviar_ficha_propiedad',
    {
      description: 'Envía por email la ficha detallada de una propiedad a un cliente usando Resend.',
      inputSchema: {
        propiedad_id: z.string().describe('ID único de la propiedad'),
        propiedad_titulo: z.string().describe('Título de la propiedad'),
        propiedad_precio: z.number().describe('Precio en euros'),
        propiedad_habitaciones: z.number().describe('Número de habitaciones'),
        propiedad_metros: z.number().describe('Superficie en m²'),
        propiedad_descripcion: z.string().describe('Descripción de la propiedad'),
        propiedad_url: z.string().url().describe('URL del anuncio original'),
        cliente_nombre: z.string().describe('Nombre del cliente destinatario'),
        cliente_email: z.string().email().describe('Email del cliente destinatario'),
      },
    },
    async (datos) => {
      const resultado = await enviarFichaPropiedad(datos);

      return {
        content: [
          {
            type: 'text',
            text:
              `📧 Ficha enviada correctamente\n\n` +
              `✉️  Destinatario: ${resultado.enviado_a}\n` +
              `🏠 Propiedad: ${datos.propiedad_titulo}\n` +
              `💶 Precio: ${datos.propiedad_precio.toLocaleString('es-ES')} €\n` +
              `🆔 ID del email: ${resultado.email_id}`,
          },
        ],
      };
    }
  );
}
