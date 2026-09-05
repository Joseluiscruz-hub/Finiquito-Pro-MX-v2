import type { FormState } from "../types/finiquito";

const FOLIO_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,23}$/;

function hashSeed(seed: string): string {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(4, "0").slice(-4);
}

export function normalizeFolio(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

/** Folio de control interno. Si el usuario captura uno, se respeta. */
export function documentFolio(form: FormState): string {
  const captured = normalizeFolio(form.folio);
  if (FOLIO_PATTERN.test(captured)) return captured;

  const date = /^\d{4}-\d{2}-\d{2}$/.test(form.endDate)
    ? form.endDate.replaceAll("-", "")
    : "00000000";
  const seed = [form.employee, form.company, form.endDate, form.exitType].join("|");
  return `FP-${date}-${hashSeed(seed)}`;
}
