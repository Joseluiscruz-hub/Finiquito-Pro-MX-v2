import type { CalculationResult, ExitType, FormState, WorkZone } from "../types/finiquito";
import { calculate } from "./calculations";
import { exitLabels, initialForm, workZoneLabels } from "./constants";
import { sanitizeDraft } from "./draft";
import { documentFolio } from "./folio";

export const MAX_BATCH_ROWS = 200;

export const BATCH_TEMPLATE_HEADERS = [
  "trabajador",
  "rfc_trabajador",
  "empresa",
  "rfc_empresa",
  "domicilio",
  "ciudad",
  "elaboro",
  "folio",
  "causa",
  "zona",
  "fecha_ingreso",
  "fecha_baja",
  "salario_mensual",
  "dias_sueldo_pendiente",
  "dias_aguinaldo",
  "dias_aguinaldo_pagados",
  "prima_vacacional",
  "vacaciones_tomadas",
  "vacaciones_pendientes",
  "comisiones",
  "ptu",
  "otras_percepciones",
  "incluir_20_dias",
  "isr",
  "imss",
  "infonavit",
  "otras_deducciones",
] as const;

type FormField = keyof FormState;

const HEADER_ALIASES: Record<string, FormField> = {
  trabajador: "employee",
  employee: "employee",
  nombre: "employee",
  rfc_trabajador: "employeeRfc",
  rfcempleado: "employeeRfc",
  empresa: "company",
  company: "company",
  rfc_empresa: "companyRfc",
  rfcempresa: "companyRfc",
  domicilio: "companyAddress",
  direccion: "companyAddress",
  ciudad: "documentCity",
  elaboro: "preparedBy",
  elabor: "preparedBy",
  folio: "folio",
  causa: "exitType",
  exittype: "exitType",
  zona: "workZone",
  workzone: "workZone",
  fecha_ingreso: "startDate",
  fechainicio: "startDate",
  startdate: "startDate",
  fecha_baja: "endDate",
  fechafin: "endDate",
  enddate: "endDate",
  salario_mensual: "monthlySalary",
  salario: "monthlySalary",
  monthlysalary: "monthlySalary",
  dias_sueldo_pendiente: "pendingSalaryDays",
  pendingsalarydays: "pendingSalaryDays",
  dias_aguinaldo: "aguinaldoDays",
  aguinaldodays: "aguinaldoDays",
  dias_aguinaldo_pagados: "aguinaldoPaidDays",
  aguinaldopaiddays: "aguinaldoPaidDays",
  prima_vacacional: "vacationPremium",
  vacationpremium: "vacationPremium",
  vacaciones_tomadas: "vacationTaken",
  vacationtaken: "vacationTaken",
  vacaciones_pendientes: "accruedVacationDays",
  accruedvacationdays: "accruedVacationDays",
  comisiones: "commissions",
  commissions: "commissions",
  ptu: "ptu",
  otras_percepciones: "otherEarnings",
  otherearnings: "otherEarnings",
  incluir_20_dias: "includeTwentyDays",
  includetwentydays: "includeTwentyDays",
  isr: "isr",
  imss: "imss",
  infonavit: "infonavit",
  otras_deducciones: "otherDeductions",
  otherdeductions: "otherDeductions",
};

const EXIT_BY_LABEL = new Map<string, ExitType>(
  Object.entries(exitLabels).flatMap(([value, label]) => [
    [normalizeKey(label), value as ExitType],
    [normalizeKey(value), value as ExitType],
  ]),
);

const ZONE_BY_LABEL = new Map<string, WorkZone>(
  Object.entries(workZoneLabels).flatMap(([value, label]) => [
    [normalizeKey(label), value as WorkZone],
    [normalizeKey(value), value as WorkZone],
    [normalizeKey(value.replaceAll("-", " ")), value as WorkZone],
  ]),
);

export type BatchRowStatus = "ok" | "invalid-dates" | "error";

export type BatchRow = {
  id: string;
  line: number;
  form: FormState;
  result: CalculationResult;
  folio: string;
  status: BatchRowStatus;
  message?: string;
};

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function spreadsheetSafe(value: string | number | null): string {
  const text = String(value ?? "");
  return /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
}

function csvCell(value: string | number | null): string {
  return `"${spreadsheetSafe(value).replaceAll('"', '""')}"`;
}

function parseCsv(text: string): string[][] {
  const input = text.replace(/^\ufeff/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function parseNumber(raw: string, fallback: number): number {
  const cleaned = raw.replace(/[$\s]/g, "").replace(",", ".");
  if (!cleaned) return fallback;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function parseBoolean(raw: string, fallback: boolean): boolean {
  const key = normalizeKey(raw);
  if (!key) return fallback;
  if (["1", "true", "si", "yes", "y", "x"].includes(key)) return true;
  if (["0", "false", "no", "n"].includes(key)) return false;
  return fallback;
}

function parseExitType(raw: string): ExitType {
  return EXIT_BY_LABEL.get(normalizeKey(raw)) ?? initialForm.exitType;
}

function parseWorkZone(raw: string): WorkZone {
  return ZONE_BY_LABEL.get(normalizeKey(raw)) ?? initialForm.workZone;
}

function parseDate(raw: string, fallback: string): string {
  const value = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const mx = value.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (mx) {
    const day = mx[1].padStart(2, "0");
    const month = mx[2].padStart(2, "0");
    return `${mx[3]}-${month}-${day}`;
  }
  return fallback;
}

export function buildBatchTemplateCsv(): string {
  const sample = [
    initialForm.employee,
    initialForm.employeeRfc,
    initialForm.company,
    initialForm.companyRfc,
    initialForm.companyAddress,
    initialForm.documentCity,
    initialForm.preparedBy,
    "",
    initialForm.exitType,
    initialForm.workZone,
    initialForm.startDate,
    initialForm.endDate,
    String(initialForm.monthlySalary),
    String(initialForm.pendingSalaryDays),
    String(initialForm.aguinaldoDays),
    String(initialForm.aguinaldoPaidDays),
    String(initialForm.vacationPremium),
    String(initialForm.vacationTaken),
    String(initialForm.accruedVacationDays),
    String(initialForm.commissions),
    String(initialForm.ptu),
    String(initialForm.otherEarnings),
    initialForm.includeTwentyDays ? "si" : "no",
    String(initialForm.isr),
    String(initialForm.imss),
    String(initialForm.infonavit),
    String(initialForm.otherDeductions),
  ];
  return [BATCH_TEMPLATE_HEADERS.join(","), sample.map(csvCell).join(",")].join("\r\n");
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([`\ufeff${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 150);
}

function rowToPartial(headers: string[], cells: string[]): Record<string, unknown> {
  const partial: Record<string, unknown> = {};
  headers.forEach((header, index) => {
    const field = HEADER_ALIASES[normalizeKey(header)];
    if (!field) return;
    const raw = (cells[index] ?? "").trim();
    switch (field) {
      case "exitType":
        partial.exitType = parseExitType(raw);
        break;
      case "workZone":
        partial.workZone = parseWorkZone(raw);
        break;
      case "includeTwentyDays":
        partial.includeTwentyDays = parseBoolean(raw, initialForm.includeTwentyDays);
        break;
      case "startDate":
        partial.startDate = parseDate(raw, initialForm.startDate);
        break;
      case "endDate":
        partial.endDate = parseDate(raw, initialForm.endDate);
        break;
      case "monthlySalary":
      case "pendingSalaryDays":
      case "aguinaldoDays":
      case "aguinaldoPaidDays":
      case "vacationPremium":
      case "vacationTaken":
      case "accruedVacationDays":
      case "commissions":
      case "ptu":
      case "otherEarnings":
      case "isr":
      case "imss":
      case "infonavit":
      case "otherDeductions":
        partial[field] = parseNumber(raw, initialForm[field] as number);
        break;
      default:
        partial[field] = raw;
    }
  });
  return partial;
}

export function parseBatchCsv(text: string): BatchRow[] {
  const matrix = parseCsv(text);
  if (matrix.length < 2) return [];
  const headers = matrix[0];
  const rows: BatchRow[] = [];

  for (let index = 1; index < matrix.length; index += 1) {
    if (rows.length >= MAX_BATCH_ROWS) break;
    const line = index + 1;
    try {
      const partial = rowToPartial(headers, matrix[index]);
      const form = sanitizeDraft({ ...initialForm, ...partial });
      const result = calculate(form);
      const folio = documentFolio(form);
      rows.push({
        id: `batch-${line}-${folio}`,
        line,
        form,
        result,
        folio,
        status: result.validDates ? "ok" : "invalid-dates",
        message: result.validDates ? undefined : "Fechas inválidas",
      });
    } catch (error) {
      rows.push({
        id: `batch-${line}-error`,
        line,
        form: initialForm,
        result: calculate(initialForm),
        folio: "—",
        status: "error",
        message: error instanceof Error ? error.message : "Fila inválida",
      });
    }
  }
  return rows;
}

export function buildBatchSummaryCsv(rows: BatchRow[]): string {
  const header = [
    "Folio",
    "Trabajador",
    "Empresa",
    "Causa",
    "Finiquito",
    "Liquidacion",
    "Deducciones",
    "Bruto",
    "Neto",
    "Fechas validas",
    "Estado",
  ];
  const body = rows.map((row) => [
    row.folio,
    row.form.employee,
    row.form.company,
    exitLabels[row.form.exitType],
    row.result.finiquito,
    row.result.liquidation,
    row.result.deductions,
    row.result.gross,
    row.result.net,
    row.result.validDates ? "si" : "no",
    row.status,
  ]);
  return [header, ...body].map((line) => line.map(csvCell).join(",")).join("\r\n");
}
