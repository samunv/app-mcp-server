import axios from 'axios';

export type TipoPunto = 'metro' | 'colegio' | 'supermercado' | 'parque' | 'hospital';

export interface PuntoInteres {
  nombre: string;
  tipo: TipoPunto;
  distancia_metros: number;
  direccion: string;
  rating?: number;
}

const TIPO_A_GOOGLE: Record<TipoPunto, string> = {
  metro: 'subway_station',
  colegio: 'school',
  supermercado: 'supermarket',
  parque: 'park',
  hospital: 'hospital',
};

// ─── Llamada real a Google Places ────────────────────────────────────────────

async function obtenerPorGooglePlaces(
  lat: number,
  lng: number,
  tipo: TipoPunto,
  radio: number
): Promise<PuntoInteres[]> {
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

  const res = await axios.get(url, {
    params: {
      location: `${lat},${lng}`,
      radius: radio,
      type: TIPO_A_GOOGLE[tipo],
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (res.data.results as any[]).slice(0, 5).map((place) => ({
    nombre: place.name,
    tipo,
    distancia_metros: Math.round(
      calcularDistancia(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
    ),
    direccion: place.vicinity ?? '',
    rating: place.rating,
  }));
}

async function geocodificar(direccion: string): Promise<{ lat: number; lng: number }> {
  const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: { address: direccion, key: process.env.GOOGLE_MAPS_API_KEY },
  });

  if (res.data.results.length === 0) {
    throw new Error(`No se pudo geocodificar la dirección: ${direccion}`);
  }

  const { lat, lng } = res.data.results[0].geometry.location;
  return { lat, lng };
}

// ─── Datos simulados ──────────────────────────────────────────────────────────

const MOCK_PUNTOS: Record<TipoPunto, PuntoInteres[]> = {
  metro: [
    { nombre: 'Metro Ríos Rosas', tipo: 'metro', distancia_metros: 320, direccion: 'Calle Ríos Rosas', rating: 4.2 },
    { nombre: 'Metro Alvarado', tipo: 'metro', distancia_metros: 580, direccion: 'Glorieta de Alvarado', rating: 4.0 },
  ],
  colegio: [
    { nombre: 'CEIP Ríos Rosas', tipo: 'colegio', distancia_metros: 200, direccion: 'Calle Alonso Cano, 3', rating: 4.1 },
    { nombre: 'Colegio Sagrado Corazón', tipo: 'colegio', distancia_metros: 450, direccion: 'Calle Modesto Lafuente, 2', rating: 4.3 },
  ],
  supermercado: [
    { nombre: 'Mercadona', tipo: 'supermercado', distancia_metros: 150, direccion: 'Calle Alonso Cano, 10', rating: 4.0 },
    { nombre: 'Lidl', tipo: 'supermercado', distancia_metros: 400, direccion: 'Calle Santa Engracia, 80', rating: 3.9 },
  ],
  parque: [
    { nombre: 'Parque del Oeste', tipo: 'parque', distancia_metros: 600, direccion: 'Paseo de Moret', rating: 4.6 },
  ],
  hospital: [
    { nombre: 'Hospital La Paz', tipo: 'hospital', distancia_metros: 900, direccion: 'Paseo de la Castellana, 261', rating: 4.3 },
  ],
};

// ─── Haversine: distancia entre dos coordenadas en metros ────────────────────

function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Punto de entrada del servicio ───────────────────────────────────────────

export async function obtenerPuntosInteres(
  direccion: string,
  tipos: TipoPunto[],
  radio = 1000
): Promise<PuntoInteres[]> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    // Devuelve mock filtrado por los tipos pedidos
    return tipos.flatMap((t) => MOCK_PUNTOS[t] ?? []);
  }

  const { lat, lng } = await geocodificar(direccion);
  const resultados = await Promise.all(
    tipos.map((tipo) => obtenerPorGooglePlaces(lat, lng, tipo, radio))
  );

  return resultados
    .flat()
    .sort((a, b) => a.distancia_metros - b.distancia_metros);
}
