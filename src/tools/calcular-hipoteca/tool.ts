import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { calcularHipoteca } from './calculator';

export function registerCalcularHipoteca(server: McpServer): void {
  server.registerTool(
    'calcular_hipoteca',
    {
      description:
        'Calcula la cuota mensual de una hipoteca, el total de intereses, TAE y el ratio deuda/ingresos.',
      inputSchema: {
        precio_vivienda: z.number().describe('Precio total de la vivienda en euros'),
        entrada: z
          .number()
          .describe('Importe de la entrada en euros (ej: 50000 para 50.000 €)'),
        plazo_anios: z
          .number()
          .default(30)
          .describe('Plazo de la hipoteca en años (ej: 25, 30)'),
        tipo_interes_anual: z
          .number()
          .default(3.5)
          .describe('Tipo de interés anual en % (ej: 3.5)'),
        ingresos_mensuales_netos: z
          .number()
          .optional()
          .describe('Ingresos netos mensuales del solicitante en euros'),
      },
    },
    async (datos) => {
      const r = calcularHipoteca(datos);

      return {
        content: [
          {
            type: 'text',
            text:
              `📊 Simulación de hipoteca\n\n` +
              `💶 Precio vivienda:      ${datos.precio_vivienda.toLocaleString('es-ES')} €\n` +
              `💰 Entrada:              ${datos.entrada.toLocaleString('es-ES')} € (${r.porcentaje_entrada}%)\n` +
              `🏦 Capital financiado:   ${r.capital_financiado.toLocaleString('es-ES')} €\n` +
              `📅 Plazo:                ${datos.plazo_anios} años (${datos.plazo_anios * 12} cuotas)\n` +
              `📈 Tipo interés:         ${datos.tipo_interes_anual}% TIN | ${r.tae}% TAE\n\n` +
              `─────────────────────────────────────\n` +
              `💳 Cuota mensual:        ${r.cuota_mensual.toLocaleString('es-ES')} €/mes\n` +
              `💸 Total pagado:         ${r.total_pagado.toLocaleString('es-ES')} €\n` +
              `🔴 Total intereses:      ${r.total_intereses.toLocaleString('es-ES')} €\n` +
              (r.ratio_deuda_ingresos !== null
                ? `📉 Ratio deuda/ingresos: ${r.ratio_deuda_ingresos}%\n`
                : '') +
              `─────────────────────────────────────\n\n` +
              r.recomendacion,
          },
        ],
      };
    }
  );
}
