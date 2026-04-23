import { google } from 'googleapis';

export interface DatosVisita {
  propiedad_id: string;
  propiedad_titulo: string;
  propiedad_direccion: string;
  cliente_nombre: string;
  cliente_email: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:MM
  duracion_minutos?: number;
}

export interface ResultadoVisita {
  evento_id: string;
  enlace_calendario: string;
  fecha_hora: string;
}

// ─── Google Calendar (real) ──────────────────────────────────────────────────

function getCalendarClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  );

  auth.setCredentials({ refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN });

  return google.calendar({ version: 'v3', auth });
}

async function agendarEnGoogleCalendar(datos: DatosVisita): Promise<ResultadoVisita> {
  const calendar = getCalendarClient();

  const inicioISO = `${datos.fecha}T${datos.hora}:00`;
  const duracion = datos.duracion_minutos ?? 60;

  const inicio = new Date(inicioISO);
  const fin = new Date(inicio.getTime() + duracion * 60 * 1000);

  const evento = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID ?? 'primary',
    requestBody: {
      summary: `Visita: ${datos.propiedad_titulo}`,
      description:
        `Cliente: ${datos.cliente_nombre}\n` +
        `Email: ${datos.cliente_email}\n` +
        `Propiedad ID: ${datos.propiedad_id}`,
      location: datos.propiedad_direccion,
      start: { dateTime: inicio.toISOString(), timeZone: 'Europe/Madrid' },
      end: { dateTime: fin.toISOString(), timeZone: 'Europe/Madrid' },
      attendees: [{ email: datos.cliente_email, displayName: datos.cliente_nombre }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 },  // 24h antes
          { method: 'popup', minutes: 30 },
        ],
      },
    },
  });

  return {
    evento_id: evento.data.id ?? 'desconocido',
    enlace_calendario: evento.data.htmlLink ?? '',
    fecha_hora: `${datos.fecha} ${datos.hora}`,
  };
}

// ─── Simulación (sin API key) ────────────────────────────────────────────────

function agendarEnMock(datos: DatosVisita): ResultadoVisita {
  return {
    evento_id: `MOCK-${Date.now()}`,
    enlace_calendario: `https://calendar.google.com/calendar/event?eid=MOCK_${datos.propiedad_id}`,
    fecha_hora: `${datos.fecha} ${datos.hora}`,
  };
}

// ─── Punto de entrada del servicio ───────────────────────────────────────────

export async function agendarVisita(datos: DatosVisita): Promise<ResultadoVisita> {
  const tieneCredenciales =
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
    process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;

  if (tieneCredenciales) {
    return agendarEnGoogleCalendar(datos);
  }

  return agendarEnMock(datos);
}
