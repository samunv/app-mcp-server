export interface DatosHipoteca {
  precio_vivienda: number;
  entrada: number;          // importe de la entrada (no porcentaje)
  plazo_anios: number;
  tipo_interes_anual: number; // en % ej: 3.5
  ingresos_mensuales_netos?: number;
}

export interface ResultadoHipoteca {
  capital_financiado: number;
  cuota_mensual: number;
  total_pagado: number;
  total_intereses: number;
  porcentaje_entrada: number;
  ratio_deuda_ingresos: number | null; // null si no se proporcionan ingresos
  tae: number;
  recomendacion: string;
}

export function calcularHipoteca(datos: DatosHipoteca): ResultadoHipoteca {
  const capital = datos.precio_vivienda - datos.entrada;
  const r = datos.tipo_interes_anual / 100 / 12; // tasa mensual
  const n = datos.plazo_anios * 12;               // número de cuotas

  // Fórmula francesa de amortización
  const cuota = r === 0
    ? capital / n
    : (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const totalPagado = cuota * n;
  const totalIntereses = totalPagado - capital;
  const porcentajeEntrada = (datos.entrada / datos.precio_vivienda) * 100;

  // TAE aproximada (sin comisiones)
  const tae = (Math.pow(1 + r, 12) - 1) * 100;

  // Ratio deuda/ingresos (regla del 30%)
  const ratio = datos.ingresos_mensuales_netos
    ? (cuota / datos.ingresos_mensuales_netos) * 100
    : null;

  const recomendacion = generarRecomendacion(porcentajeEntrada, ratio, capital, datos.precio_vivienda);

  return {
    capital_financiado: Math.round(capital),
    cuota_mensual: Math.round(cuota * 100) / 100,
    total_pagado: Math.round(totalPagado),
    total_intereses: Math.round(totalIntereses),
    porcentaje_entrada: Math.round(porcentajeEntrada * 10) / 10,
    ratio_deuda_ingresos: ratio !== null ? Math.round(ratio * 10) / 10 : null,
    tae: Math.round(tae * 100) / 100,
    recomendacion,
  };
}

function generarRecomendacion(
  porcentajeEntrada: number,
  ratio: number | null,
  capital: number,
  precio: number
): string {
  const alertas: string[] = [];

  if (porcentajeEntrada < 20) {
    alertas.push(`⚠️ La entrada es menor al 20% (${porcentajeEntrada.toFixed(1)}%). Los bancos suelen financiar como máximo el 80% del valor.`);
  }

  if (ratio !== null) {
    if (ratio > 40) {
      alertas.push(`🔴 El ratio deuda/ingresos es del ${ratio.toFixed(1)}%, muy por encima del 35% recomendado. Riesgo alto.`);
    } else if (ratio > 35) {
      alertas.push(`🟡 El ratio deuda/ingresos es del ${ratio.toFixed(1)}%, ligeramente por encima del 35% recomendado.`);
    } else {
      alertas.push(`✅ El ratio deuda/ingresos es del ${ratio.toFixed(1)}%, dentro del límite saludable (máx. 35%).`);
    }
  }

  const ltvRatio = (capital / precio) * 100;
  if (ltvRatio > 80) {
    alertas.push(`⚠️ LTV del ${ltvRatio.toFixed(1)}% — necesitarás seguro hipotecario o aval bancario.`);
  }

  return alertas.join('\n') || '✅ Las condiciones de la hipoteca son favorables.';
}
