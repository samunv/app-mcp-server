import { Resend } from 'resend';

export interface DatosFicha {
  propiedad_id: string;
  propiedad_titulo: string;
  propiedad_precio: number;
  propiedad_habitaciones: number;
  propiedad_metros: number;
  propiedad_descripcion: string;
  propiedad_url: string;
  cliente_nombre: string;
  cliente_email: string;
}

export interface ResultadoEnvio {
  email_id: string;
  enviado_a: string;
}

// ─── Plantilla HTML del email ─────────────────────────────────────────────────

function generarHtmlFicha(datos: DatosFicha): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Ficha de propiedad</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1a3c5e; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">🏠 Ficha de Propiedad</h1>
  </div>

  <div style="border: 1px solid #ddd; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>Hola <strong>${datos.cliente_nombre}</strong>,</p>
    <p>Te enviamos la ficha detallada de la propiedad que te interesó:</p>

    <div style="background: #f8f9fa; border-left: 4px solid #1a3c5e; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <h2 style="margin: 0 0 12px 0; color: #1a3c5e;">${datos.propiedad_titulo}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 140px;">Precio</td>
          <td style="color: #e74c3c; font-size: 20px; font-weight: bold;">
            ${datos.propiedad_precio.toLocaleString('es-ES')} €
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Habitaciones</td>
          <td>${datos.propiedad_habitaciones}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Superficie</td>
          <td>${datos.propiedad_metros} m²</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #1a3c5e;">Descripción</h3>
    <p>${datos.propiedad_descripcion}</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${datos.propiedad_url}"
         style="background: #1a3c5e; color: white; padding: 12px 32px; border-radius: 6px;
                text-decoration: none; font-weight: bold; display: inline-block;">
        Ver ficha completa online
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      Este email fue enviado por tu Agencia Inmobiliaria.<br>
      Si no solicitaste esta información, ignora este mensaje.
    </p>
  </div>
</body>
</html>`;
}

// ─── Envío con Resend ────────────────────────────────────────────────────────

async function enviarConResend(datos: DatosFicha): Promise<ResultadoEnvio> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Agencia <noreply@tuinmobiliaria.com>',
    to: datos.cliente_email,
    subject: `Ficha de propiedad: ${datos.propiedad_titulo}`,
    html: generarHtmlFicha(datos),
  });

  if (error || !data) {
    throw new Error(`Error al enviar email: ${error?.message ?? 'desconocido'}`);
  }

  return { email_id: data.id, enviado_a: datos.cliente_email };
}

// ─── Simulación (sin API key) ────────────────────────────────────────────────

function enviarEnMock(datos: DatosFicha): ResultadoEnvio {
  console.log(`[MOCK] Email de ficha enviado a ${datos.cliente_email} — propiedad ${datos.propiedad_id}`);
  return {
    email_id: `MOCK-EMAIL-${Date.now()}`,
    enviado_a: datos.cliente_email,
  };
}

// ─── Punto de entrada del servicio ───────────────────────────────────────────

export async function enviarFichaPropiedad(datos: DatosFicha): Promise<ResultadoEnvio> {
  if (process.env.RESEND_API_KEY) {
    return enviarConResend(datos);
  }
  return enviarEnMock(datos);
}
