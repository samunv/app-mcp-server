import axios from 'axios';

export interface Propiedad {
  id: string;
  titulo: string;
  precio: number;
  habitaciones: number;
  metros: number;
  planta: string;
  direccion: string;
  zona: string;
  ciudad: string;
  descripcion: string;
  antiguedad: number;
  url: string;
}

export interface BuscarParams {
  ciudad: string;
  precio_max?: number;
  habitaciones?: number;
  metros_min?: number;
}

// ─── Datos simulados realistas ──────────────────────────────────────────────

const MOCK_PROPIEDADES: Propiedad[] = [
  {
    id: 'MAD001',
    titulo: 'Piso luminoso en Chamberí con terraza',
    precio: 285000,
    habitaciones: 2,
    metros: 75,
    planta: '3ª',
    direccion: 'Calle Alonso Cano, 25',
    zona: 'Chamberí',
    ciudad: 'Madrid',
    descripcion: 'Reformado, cocina americana, terraza de 12m². A 5 min del metro Ríos Rosas.',
    antiguedad: 20,
    url: 'https://www.idealista.com/inmueble/100001',
  },
  {
    id: 'MAD002',
    titulo: 'Piso reformado en Malasaña',
    precio: 310000,
    habitaciones: 2,
    metros: 68,
    planta: '2ª',
    direccion: 'Calle del Pez, 14',
    zona: 'Malasaña',
    ciudad: 'Madrid',
    descripcion: 'Suelos de parqué, vigas de madera originales. Metro Tribunal a 3 min.',
    antiguedad: 60,
    url: 'https://www.idealista.com/inmueble/100002',
  },
  {
    id: 'MAD003',
    titulo: 'Piso en Vallecas, primera compra',
    precio: 189000,
    habitaciones: 2,
    metros: 70,
    planta: '4ª',
    direccion: 'Calle Santa Isabel, 8',
    zona: 'Vallecas',
    ciudad: 'Madrid',
    descripcion: 'Ideal primera vivienda. Garaje incluido. Metro Buenos Aires a 2 min.',
    antiguedad: 35,
    url: 'https://www.idealista.com/inmueble/100003',
  },
  {
    id: 'MAD004',
    titulo: 'Ático en Retiro con vistas',
    precio: 490000,
    habitaciones: 3,
    metros: 110,
    planta: 'Ático',
    direccion: 'Calle Narváez, 40',
    zona: 'Retiro',
    ciudad: 'Madrid',
    descripcion: 'Ático dúplex con terraza de 40m² y vistas al parque. Metro Ibiza.',
    antiguedad: 30,
    url: 'https://www.idealista.com/inmueble/100004',
  },
  {
    id: 'MAD005',
    titulo: 'Piso amplio en Usera',
    precio: 215000,
    habitaciones: 3,
    metros: 90,
    planta: '1ª',
    direccion: 'Calle Pradillo, 22',
    zona: 'Usera',
    ciudad: 'Madrid',
    descripcion: 'Tres dormitorios, dos baños, trastero. Metro Pradillo a 4 min.',
    antiguedad: 40,
    url: 'https://www.idealista.com/inmueble/100005',
  },
  {
    id: 'BCN001',
    titulo: 'Piso modernista en Eixample',
    precio: 420000,
    habitaciones: 3,
    metros: 100,
    planta: '2ª',
    direccion: 'Carrer del Consell de Cent, 300',
    zona: 'Eixample',
    ciudad: 'Barcelona',
    descripcion: 'Techos altos, molduras originales, patio interior. Metro Passeig de Gràcia.',
    antiguedad: 100,
    url: 'https://www.idealista.com/inmueble/200001',
  },
  {
    id: 'BCN002',
    titulo: 'Piso en Gràcia cerca de Fontana',
    precio: 295000,
    habitaciones: 2,
    metros: 65,
    planta: '3ª',
    direccion: 'Carrer de Verdi, 55',
    zona: 'Gràcia',
    ciudad: 'Barcelona',
    descripcion: 'Reformado integral 2022. Balcón, ascensor. Metro Fontana a 2 min.',
    antiguedad: 55,
    url: 'https://www.idealista.com/inmueble/200002',
  },
];

// ─── Llamada real a Idealista API ────────────────────────────────────────────

async function buscarEnIdealista(params: BuscarParams): Promise<Propiedad[]> {
  const auth = Buffer.from(
    `${process.env.IDEALISTA_API_KEY}:${process.env.IDEALISTA_SECRET}`
  ).toString('base64');

  const tokenRes = await axios.post(
    'https://api.idealista.com/oauth/accesstoken',
    'grant_type=client_credentials&scope=read',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const token = tokenRes.data.access_token as string;

  const searchRes = await axios.post(
    'https://api.idealista.com/3.5/es/search',
    {
      country: 'es',
      operation: 'sale',
      propertyType: 'homes',
      locationId: params.ciudad,
      maxPrice: params.precio_max,
      bedrooms: params.habitaciones,
      minSize: params.metros_min,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (searchRes.data.elementList as any[]).map((item) => ({
    id: String(item.propertyCode),
    titulo: item.suggestedTexts?.title ?? 'Sin título',
    precio: item.price,
    habitaciones: item.rooms ?? 0,
    metros: item.size ?? 0,
    planta: item.floor ?? 'Bajo',
    direccion: item.address ?? '',
    zona: item.district ?? '',
    ciudad: item.municipality ?? params.ciudad,
    descripcion: item.description ?? '',
    antiguedad: new Date().getFullYear() - (item.constructionYear ?? new Date().getFullYear()),
    url: item.url ?? '',
  }));
}

// ─── Filtro sobre datos mock ──────────────────────────────────────────────────

function buscarEnMock(params: BuscarParams): Propiedad[] {
  return MOCK_PROPIEDADES.filter((p) => {
    const ciudadOk = p.ciudad.toLowerCase().includes(params.ciudad.toLowerCase());
    const precioOk = !params.precio_max || p.precio <= params.precio_max;
    const habitacionesOk = !params.habitaciones || p.habitaciones === params.habitaciones;
    const metrosOk = !params.metros_min || p.metros >= params.metros_min;
    return ciudadOk && precioOk && habitacionesOk && metrosOk;
  });
}

// ─── Punto de entrada del servicio ───────────────────────────────────────────

export async function buscarPropiedades(params: BuscarParams): Promise<Propiedad[]> {
  if (process.env.IDEALISTA_API_KEY && process.env.IDEALISTA_SECRET) {
    return buscarEnIdealista(params);
  }
  return buscarEnMock(params);
}
