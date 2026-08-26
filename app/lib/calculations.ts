import type { CalculationResult, FormState, LineItem } from "../types/finiquito";
import {
  MINIMUM_WAGE_GENERAL_2026,
  MINIMUM_WAGE_NORTH_BORDER_2026,
} from "./constants";
import { decimal, money } from "./formatters";

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Parsea una cadena "YYYY-MM-DD" en UTC. La validación estricta evita que
 * JavaScript normalice silenciosamente fechas inexistentes, como 2026-02-31.
 */
export function parseDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(Number.NaN);

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month, day, 12));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return new Date(Number.NaN);
  }

  return date;
}

/** Devuelve los días calendarios entre dos fechas (opcionalmente inclusivo). */
export function diffDays(start: Date, end: Date, inclusive = false): number {
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.round(ms / 86_400_000) + (inclusive ? 1 : 0));
}

/** Devuelve los años completos de antigüedad entre dos fechas. */
export function fullYears(start: Date, end: Date): number {
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return 0;

  let years = end.getUTCFullYear() - start.getUTCFullYear();
  const anniversary = new Date(
    Date.UTC(
      end.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate(),
      12,
    ),
  );
  if (end < anniversary) years -= 1;
  return Math.max(0, years);
}

function daysInCalendarYear(year: number): number {
  return diffDays(
    new Date(Date.UTC(year, 0, 1, 12)),
    new Date(Date.UTC(year + 1, 0, 1, 12)),
  );
}

// ---------------------------------------------------------------------------
// LFT helpers
// ---------------------------------------------------------------------------

/**
 * Días de vacaciones anuales según LFT Art. 76 (reforma 2024).
 * El parámetro `serviceYear` es el año de servicio en curso (1 = primer año).
 *
 * Tabla:
 *  Año 1 → 12 | Año 2 → 14 | Año 3 → 16 | Año 4 → 18 | Año 5 → 20
 *  Años 6-10 → 22 | Años 11-15 → 24 | (+ 2 días cada 5 años adicionales)
 */
export function vacationDaysForYear(serviceYear: number): number {
  if (serviceYear <= 1) return 12;
  if (serviceYear <= 5) return 10 + serviceYear * 2;
  return 20 + Math.ceil((serviceYear - 5) / 5) * 2;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Asegura que el valor sea >= 0 para evitar que entradas negativas afecten el total. */
function pos(n: number): number {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

// ---------------------------------------------------------------------------
// Sub-cálculos exportados (testeables individualmente)
// ---------------------------------------------------------------------------

export type VacationCalc = {
  annualVacationDays: number;
  proportionalVacationDays: number;
  payableVacationDays: number;
};

/**
 * Calcula vacaciones proporcionales al ciclo actual y días por pagar,
 * respetando los gozados y pendientes de ciclos anteriores.
 */
export function calculateVacations(
  form: Pick<FormState, "vacationTaken" | "accruedVacationDays">,
  start: Date,
  end: Date,
  validDates: boolean,
  years: number,
): VacationCalc {
  const serviceYear = Math.max(1, years + 1);
  const annualVacationDays = vacationDaysForYear(serviceYear);

  const cycleStart = new Date(start);
  cycleStart.setUTCFullYear(start.getUTCFullYear() + years);
  const nextAnniversary = new Date(cycleStart);
  nextAnniversary.setUTCFullYear(cycleStart.getUTCFullYear() + 1);
  const cycleDays = Math.max(1, diffDays(cycleStart, nextAnniversary));

  const daysInCycle = validDates
    ? Math.min(cycleDays, diffDays(cycleStart, end, true))
    : 0;
  const proportionalVacationDays = annualVacationDays * (daysInCycle / cycleDays);
  const payableVacationDays = Math.max(
    0,
    proportionalVacationDays - pos(form.vacationTaken) + pos(form.accruedVacationDays),
  );

  return { annualVacationDays, proportionalVacationDays, payableVacationDays };
}

/**
 * Calcula los días de aguinaldo proporcionales al periodo del año en curso,
 * descontando lo ya pagado.  LFT Art. 87.
 */
export function calculateAguinaldoDays(
  form: Pick<FormState, "aguinaldoDays" | "aguinaldoPaidDays">,
  start: Date,
  end: Date,
  validDates: boolean,
): number {
  const year = end.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1, 12));
  const aguinaldoStart = start > yearStart ? start : yearStart;
  const periodDays = validDates ? diffDays(aguinaldoStart, end, true) : 0;
  return Math.max(
    0,
    pos(form.aguinaldoDays) * (periodDays / daysInCalendarYear(year)) -
      pos(form.aguinaldoPaidDays),
  );
}

/**
 * Calcula el factor de integración salarial.
 * Integra aguinaldo, vacaciones y prima vacacional proporcionales al año.
 */
export function calculateIntegrationFactor(
  aguinaldoDays: number,
  annualVacationDays: number,
  vacationPremiumPct: number,
): number {
  return (
    1 +
    pos(aguinaldoDays) / 365 +
    (annualVacationDays * (pos(vacationPremiumPct) / 100)) / 365
  );
}

// ---------------------------------------------------------------------------
// Motor principal
// ---------------------------------------------------------------------------

export function calculate(form: FormState): CalculationResult {
  const start = parseDate(form.startDate);
  const end = parseDate(form.endDate);
  const validDates =
    !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start;

  const dailySalary = pos(form.monthlySalary) / 30;
  const daysWorked = validDates ? diffDays(start, end, true) : 0;
  const years = validDates ? fullYears(start, end) : 0;
  const serviceYears = daysWorked / 365.2425;
  const minimumWage =
    form.workZone === "north-border"
      ? MINIMUM_WAGE_NORTH_BORDER_2026
      : MINIMUM_WAGE_GENERAL_2026;

  const { annualVacationDays, proportionalVacationDays, payableVacationDays } =
    calculateVacations(form, start, end, validDates, years);

  const accruedAguinaldoDays = calculateAguinaldoDays(form, start, end, validDates);

  const integrationFactor = calculateIntegrationFactor(
    form.aguinaldoDays,
    annualVacationDays,
    form.vacationPremium,
  );
  const integratedDailySalary = dailySalary * integrationFactor;

  // La base para prima de antigüedad tiene tope de 2 × salario mínimo (LFT arts. 485-486).
  const premiumBaseSalary = Math.min(dailySalary, minimumWage * 2);

  const getsThreeMonths =
    validDates &&
    (form.exitType === "despido-injustificado" || form.exitType === "rescision-patron");
  const getsSeniorityPremium =
    validDates &&
    (form.exitType === "despido-injustificado" ||
      form.exitType === "rescision-patron" ||
      form.exitType === "despido-justificado" ||
      (form.exitType === "renuncia" && serviceYears >= 15));
  const getsTwentyDays = getsThreeMonths && form.includeTwentyDays;

  const vacationAmount = payableVacationDays * dailySalary;
  const fmt = (n: number) => money.format(n);
  const dec = (n: number, d = 2) => decimal(n, d);

  const items: LineItem[] = [
    {
      key: "salary",
      label: "Sueldo pendiente",
      amount: dailySalary * pos(form.pendingSalaryDays),
      formula: `${dec(form.pendingSalaryDays)} días × ${fmt(dailySalary)}`,
      group: "finiquito",
    },
    {
      key: "aguinaldo",
      label: "Aguinaldo proporcional",
      amount: dailySalary * accruedAguinaldoDays,
      formula: `${dec(accruedAguinaldoDays)} días generados × ${fmt(dailySalary)}`,
      legal: "LFT, art. 87",
      group: "finiquito",
    },
    {
      key: "vacation",
      label: "Vacaciones pendientes",
      amount: vacationAmount,
      formula: `${dec(payableVacationDays)} días × ${fmt(dailySalary)}`,
      legal: "LFT, arts. 76 y 79",
      group: "finiquito",
    },
    {
      key: "vacation-premium",
      label: "Prima vacacional",
      amount: vacationAmount * (pos(form.vacationPremium) / 100),
      formula: `${fmt(vacationAmount)} × ${dec(form.vacationPremium)}%`,
      legal: "LFT, art. 80",
      group: "finiquito",
    },
    {
      key: "commissions",
      label: "Comisiones y bonos",
      amount: pos(form.commissions),
      formula: "Importe capturado",
      group: "finiquito",
    },
    {
      key: "ptu",
      label: "PTU pendiente",
      amount: pos(form.ptu),
      formula: "Importe capturado",
      group: "finiquito",
    },
    {
      key: "other-earnings",
      label: "Otras percepciones",
      amount: pos(form.otherEarnings),
      formula: "Importe capturado",
      group: "finiquito",
    },
    {
      key: "three-months",
      label: "Indemnización constitucional",
      amount: getsThreeMonths ? integratedDailySalary * 90 : 0,
      formula: `90 días × SDI ${fmt(integratedDailySalary)}`,
      legal: "LFT, arts. 48 y 50",
      group: "liquidacion",
    },
    {
      key: "twenty-days",
      label: "20 días por año",
      amount: getsTwentyDays ? integratedDailySalary * 20 * serviceYears : 0,
      formula: `20 × ${dec(serviceYears, 3)} años × SDI ${fmt(integratedDailySalary)}`,
      legal: "LFT, art. 50; sujeto al supuesto aplicable",
      group: "liquidacion",
    },
    {
      key: "seniority",
      label: "Prima de antigüedad",
      amount: getsSeniorityPremium ? premiumBaseSalary * 12 * serviceYears : 0,
      formula: `12 × ${dec(serviceYears, 3)} años × ${fmt(premiumBaseSalary)}`,
      legal: "LFT, arts. 162, 485 y 486",
      group: "liquidacion",
    },
    {
      key: "isr",
      label: "ISR retenido",
      amount: pos(form.isr),
      formula: "Importe de nómina capturado",
      group: "deduccion",
    },
    {
      key: "imss",
      label: "Cuota IMSS",
      amount: pos(form.imss),
      formula: "Importe de nómina capturado",
      group: "deduccion",
    },
    {
      key: "infonavit",
      label: "Crédito Infonavit",
      amount: pos(form.infonavit),
      formula: "Importe de nómina capturado",
      group: "deduccion",
    },
    {
      key: "other-deductions",
      label: "Otras deducciones autorizadas",
      amount: pos(form.otherDeductions),
      formula: "Importe capturado",
      group: "deduccion",
    },
  ];

  const sumGroup = (group: LineItem["group"]) =>
    items
      .filter((item) => item.group === group)
      .reduce((total, item) => total + item.amount, 0);

  const finiquito = sumGroup("finiquito");
  const liquidation = sumGroup("liquidacion");
  const deductions = sumGroup("deduccion");
  const gross = finiquito + liquidation;

  return {
    validDates,
    minimumWage,
    dailySalary,
    integratedDailySalary,
    daysWorked,
    years,
    serviceYears,
    annualVacationDays,
    proportionalVacationDays,
    payableVacationDays,
    accruedAguinaldoDays,
    items,
    finiquito,
    liquidation,
    deductions,
    uncoveredDeductions: Math.max(0, deductions - gross),
    gross,
    net: Math.max(0, gross - deductions),
  };
}
