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

/** Fecha ISO (YYYY-MM-DD) a texto largo en español, sin desfase de zona. */
export function formatLongDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "—";
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
