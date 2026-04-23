export interface DatosValoracion {
  ciudad: string;
  zona: string;
  metros_cuadrados: number;
  antiguedad_anios: number;
  planta: number;       // 0 = bajo, -1 = sótano, 1 = primera, etc.
  tiene_ascensor: boolean;
  tiene_terraza: boolean;
  estado: 'a_reformar' | 'buen_estado' | 'reformado';
}

export interface ResultadoValoracion {
  precio_estimado: number;
  precio_min: number;
  precio_max: number;
  precio_por_m2: number;
  factores_aplicados: string[];
}

// ─── Precio base por m² según ciudad y zona ───────────────────────────────────
// Datos aproximados basados en precios reales del mercado español (€/m²)

const PRECIOS_BASE: Record<string, Record<string, number>> = {
  madrid: {
    'salamanca': 6500,
    'jerónimos': 6200,
    'retiro': 5800,
    'chamberí': 5200,
    'malasaña': 5000,
    'chueca': 4800,
    'lavapiés': 4200,
    'arganzuela': 4000,
    'usera': 3200,
    'vallecas': 2800,
    'carabanchel': 2600,
    'villaverde': 2200,
    'default': 3500,
  },
  barcelona: {
    'eixample': 5500,
    'gràcia': 5000,
    'sarrià': 5800,
    'sant gervasi': 5600,
    'barceloneta': 4800,
    'poblenou': 4500,
    'sants': 4000,
    'les corts': 4800,
    'horta': 3200,
    'nou barris': 2800,
    'default': 4000,
  },
  valencia: {
    'ruzafa': 3200,
    'ciudad vieja': 3000,
    'extramurs': 2800,
    'campanar': 2600,
    'benimaclet': 2400,
    'default': 2200,
  },
  sevilla: {
    'casco antiguo': 3000,
    'triana': 2800,
    'nervión': 2600,
    'default': 2000,
  },
};

function getPrecioBase(ciudad: string, zona: string): number {
  const ciudadNorm = ciudad.toLowerCase().trim();
  const zonaNorm = zona.toLowerCase().trim();

  const precios = PRECIOS_BASE[ciudadNorm];
  if (!precios) return 2500; // ciudad no mapeada

  return precios[zonaNorm] ?? precios['default'];
}

// ─── Correcciones sobre el precio base ───────────────────────────────────────

function aplicarCorrecciones(
  precioBase: number,
  datos: DatosValoracion
): { precioFinal: number; factores: string[] } {
  let precio = precioBase;
  const factores: string[] = [`Base zona "${datos.zona}": ${precioBase.toLocaleString('es-ES')} €/m²`];

  // Antigüedad
  if (datos.antiguedad_anios <= 5) {
    precio *= 1.10;
    factores.push('+10% obra nueva (≤5 años)');
  } else if (datos.antiguedad_anios <= 15) {
    precio *= 1.05;
    factores.push('+5% inmueble reciente (≤15 años)');
  } else if (datos.antiguedad_anios > 40) {
    precio *= 0.88;
    factores.push('-12% antigüedad >40 años');
  } else if (datos.antiguedad_anios > 25) {
    precio *= 0.94;
    factores.push('-6% antigüedad >25 años');
  }

  // Estado
  if (datos.estado === 'reformado') {
    precio *= 1.08;
    factores.push('+8% reformado');
  } else if (datos.estado === 'a_reformar') {
    precio *= 0.85;
    factores.push('-15% a reformar');
  }

  // Planta
  if (datos.planta <= 0) {
    precio *= 0.90;
    factores.push('-10% planta baja o sótano');
  } else if (datos.planta >= 5) {
    precio *= 1.06;
    factores.push('+6% planta alta (≥5ª)');
  }

  // Extras
  if (!datos.tiene_ascensor && datos.planta > 2) {
    precio *= 0.92;
    factores.push('-8% sin ascensor en planta alta');
  }

  if (datos.tiene_terraza) {
    precio *= 1.07;
    factores.push('+7% terraza');
  }

  return { precioFinal: Math.round(precio), factores };
}

// ─── Cálculo principal ────────────────────────────────────────────────────────

export function valorarInmueble(datos: DatosValoracion): ResultadoValoracion {
  const precioBaseM2 = getPrecioBase(datos.ciudad, datos.zona);
  const { precioFinal: precioPorM2, factores } = aplicarCorrecciones(precioBaseM2, datos);

  const precioEstimado = Math.round(precioPorM2 * datos.metros_cuadrados);
  const margen = 0.08; // ±8% de horquilla

  return {
    precio_estimado: precioEstimado,
    precio_min: Math.round(precioEstimado * (1 - margen)),
    precio_max: Math.round(precioEstimado * (1 + margen)),
    precio_por_m2: precioPorM2,
    factores_aplicados: factores,
  };
}
