import type { CalculationResult, FormState } from "../types/finiquito";
import { exitLabels } from "./constants";

function spreadsheetSafe(value: string | number | null): string {
  const text = String(value ?? "");
  // Excel y otras hojas pueden ejecutar fórmulas incluso dentro de celdas CSV citadas.
  return /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
}

function csvCell(value: string | number | null): string {
  return `"${spreadsheetSafe(value).replaceAll('"', '""')}"`;
}

export function buildCsv(form: FormState, result: CalculationResult): string {
  const rows: (string | number | null)[][] = [
    ["FINIQUITO PRO MX 2026"],
    ["Trabajador", form.employee],
    ["Empresa", form.company],
    ["Causa", exitLabels[form.exitType]],
    ["Periodo", `${form.startDate} a ${form.endDate}`],
    [],
    ["Concepto", "Fórmula", "Fundamento", "Importe"],
    ...result.items
      .filter((item) => item.amount > 0)
      .map((item) => [
        item.label,
        item.formula,
        item.legal ?? "",
        item.group === "deduccion" ? -item.amount : item.amount,
      ]),
    [],
    ["Total bruto", "", "", result.gross],
    ["Deducciones", "", "", result.deductions],
    ["Neto estimado", "", "", result.net],
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function safeFileSlug(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "trabajador"
  );
}

/**
 * Genera y descarga un archivo CSV con el desglose completo del cálculo.
 *
 * Mejoras respecto a la implementación original:
 * - El enlace se añade y elimina del DOM para máxima compatibilidad entre navegadores.
 * - `URL.revokeObjectURL` se llama con delay para asegurar que el navegador
 *   inicia la descarga antes de liberar el objeto Blob.
 * - El nombre del archivo usa el prefix "finiquito-" en lugar de "calculo-laboral-".
 */
export function exportCsv(form: FormState, result: CalculationResult): void {
  const csv = buildCsv(form, result);

  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `finiquito-${safeFileSlug(form.employee)}.csv`;

  // Añadir al DOM asegura compatibilidad en Firefox y Safari.
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberar el objeto URL después de que el navegador inicie la descarga.
  window.setTimeout(() => URL.revokeObjectURL(url), 150);
}
