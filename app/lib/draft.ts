import type { ExitType, FormState, WorkZone } from "../types/finiquito";
import { initialForm } from "./constants";

const DRAFT_VERSION = 1;
const exitTypes = new Set<ExitType>([
  "renuncia",
  "despido-injustificado",
  "rescision-patron",
  "despido-justificado",
  "terminacion-contrato",
  "mutuo-acuerdo",
]);
const workZones = new Set<WorkZone>(["general", "north-border"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

type DraftEnvelope = {
  version: number;
  form: unknown;
};

function safeText(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.slice(0, 160) : fallback;
}

function safeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

function safeDate(value: unknown, fallback: string): string {
  return typeof value === "string" && datePattern.test(value) ? value : fallback;
}

/** Convierte datos externos de localStorage en un FormState confiable. */
export function sanitizeDraft(value: unknown): FormState {
  const candidate =
    value && typeof value === "object" && "form" in value
      ? (value as DraftEnvelope).form
      : value;
  const record =
    candidate && typeof candidate === "object"
      ? (candidate as Record<string, unknown>)
      : {};

  return {
    employee: safeText(record.employee, initialForm.employee),
    company: safeText(record.company, initialForm.company),
    exitType: exitTypes.has(record.exitType as ExitType)
      ? (record.exitType as ExitType)
      : initialForm.exitType,
    workZone: workZones.has(record.workZone as WorkZone)
      ? (record.workZone as WorkZone)
      : initialForm.workZone,
    startDate: safeDate(record.startDate, initialForm.startDate),
    endDate: safeDate(record.endDate, initialForm.endDate),
    monthlySalary: safeNumber(record.monthlySalary, initialForm.monthlySalary),
    pendingSalaryDays: safeNumber(
      record.pendingSalaryDays,
      initialForm.pendingSalaryDays,
    ),
    aguinaldoDays: safeNumber(record.aguinaldoDays, initialForm.aguinaldoDays),
    aguinaldoPaidDays: safeNumber(
      record.aguinaldoPaidDays,
      initialForm.aguinaldoPaidDays,
    ),
    vacationPremium: safeNumber(
      record.vacationPremium,
      initialForm.vacationPremium,
    ),
    vacationTaken: safeNumber(record.vacationTaken, initialForm.vacationTaken),
    accruedVacationDays: safeNumber(
      record.accruedVacationDays,
      initialForm.accruedVacationDays,
    ),
    commissions: safeNumber(record.commissions, initialForm.commissions),
    ptu: safeNumber(record.ptu, initialForm.ptu),
    otherEarnings: safeNumber(record.otherEarnings, initialForm.otherEarnings),
    includeTwentyDays:
      typeof record.includeTwentyDays === "boolean"
        ? record.includeTwentyDays
        : initialForm.includeTwentyDays,
    isr: safeNumber(record.isr, initialForm.isr),
    imss: safeNumber(record.imss, initialForm.imss),
    infonavit: safeNumber(record.infonavit, initialForm.infonavit),
    otherDeductions: safeNumber(
      record.otherDeductions,
      initialForm.otherDeductions,
    ),
  };
}

export function serializeDraft(form: FormState): string {
  return JSON.stringify({ version: DRAFT_VERSION, form });
}
