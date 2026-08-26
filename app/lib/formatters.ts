/** Formateador de moneda MXN reutilizable en toda la app. */
export const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

/**
 * Convierte un número a string con `digits` decimales.
 * Retorna "0.00" si el valor no es finito.
 */
export function decimal(value: number, digits = 2): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00";
}
