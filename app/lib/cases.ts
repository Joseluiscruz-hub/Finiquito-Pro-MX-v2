import type { CalculationResult, ExitType, FormState } from "../types/finiquito";
import { sanitizeDraft } from "./draft";
import { documentFolio } from "./folio";

export const CASES_STORAGE_KEY = "finiquito-pro-mx-cases";
export const MAX_STORED_CASES = 40;
const CASES_VERSION = 1;

export type StoredCase = {
  id: string;
  folio: string;
  savedAt: string;
  employee: string;
  company: string;
  exitType: ExitType;
  endDate: string;
  net: number;
  form: FormState;
};

type CasesEnvelope = {
  version: number;
  cases: unknown;
};

function isIsoDateTime(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function sanitizeCase(value: unknown): StoredCase | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.form == null && typeof record.folio !== "string" && typeof record.id !== "string") {
    return null;
  }
  const form = sanitizeDraft(record.form ?? record);
  const folio =
    typeof record.folio === "string" && record.folio.trim()
      ? record.folio.trim().slice(0, 24)
      : documentFolio(form);
  const net =
    typeof record.net === "number" && Number.isFinite(record.net) && record.net >= 0
      ? record.net
      : 0;
  const savedAt =
    typeof record.savedAt === "string" && isIsoDateTime(record.savedAt)
      ? record.savedAt
      : new Date(0).toISOString();
  const id =
    typeof record.id === "string" && record.id.trim()
      ? record.id.slice(0, 64)
      : `case-${folio}`;

  return {
    id,
    folio,
    savedAt,
    employee: form.employee,
    company: form.company,
    exitType: form.exitType,
    endDate: form.endDate,
    net,
    form,
  };
}

export function sanitizeCases(value: unknown): StoredCase[] {
  const raw =
    value && typeof value === "object" && "cases" in value
      ? (value as CasesEnvelope).cases
      : value;
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const cases: StoredCase[] = [];
  for (const item of raw) {
    const next = sanitizeCase(item);
    if (!next || seen.has(next.folio)) continue;
    seen.add(next.folio);
    cases.push(next);
    if (cases.length >= MAX_STORED_CASES) break;
  }
  return cases;
}

export function serializeCases(cases: StoredCase[]): string {
  return JSON.stringify({ version: CASES_VERSION, cases: sanitizeCases(cases) });
}

export function buildStoredCase(
  form: FormState,
  result: CalculationResult,
  savedAt = new Date().toISOString(),
): StoredCase {
  const clean = sanitizeDraft(form);
  const folio = documentFolio(clean);
  return {
    id: `case-${folio}`,
    folio,
    savedAt,
    employee: clean.employee,
    company: clean.company,
    exitType: clean.exitType,
    endDate: clean.endDate,
    net: result.net,
    form: clean,
  };
}

/** Inserta o actualiza por folio y deja el más reciente primero. */
export function upsertCase(
  cases: StoredCase[],
  form: FormState,
  result: CalculationResult,
  savedAt = new Date().toISOString(),
): StoredCase[] {
  const next = buildStoredCase(form, result, savedAt);
  return [next, ...cases.filter((item) => item.folio !== next.folio)].slice(
    0,
    MAX_STORED_CASES,
  );
}

export function removeCase(cases: StoredCase[], id: string): StoredCase[] {
  return cases.filter((item) => item.id !== id);
}
