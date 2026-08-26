/**
 * Tests unitarios para las funciones puras del motor de cálculo.
 * Ejecutar con: npm run test:calc
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateAguinaldoDays,
  calculateIntegrationFactor,
  calculateVacations,
  diffDays,
  fullYears,
  parseDate,
  vacationDaysForYear,
  calculate,
} from "../app/lib/calculations";
import type { FormState } from "../app/types/finiquito";

// ---------------------------------------------------------------------------
// parseDate
// ---------------------------------------------------------------------------
test("parseDate no desplaza la fecha por huso horario", () => {
  const d = parseDate("2026-01-01");
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth(), 0);   // enero = 0
  assert.equal(d.getUTCDate(), 1);
});

test("parseDate rechaza fechas inexistentes", () => {
  assert.ok(Number.isNaN(parseDate("2026-02-31").getTime()));
  assert.ok(Number.isNaN(parseDate("texto").getTime()));
});

// ---------------------------------------------------------------------------
// diffDays
// ---------------------------------------------------------------------------
test("diffDays misma fecha, sin inclusivo → 0", () => {
  const d = parseDate("2026-03-01");
  assert.equal(diffDays(d, d), 0);
});

test("diffDays misma fecha, inclusivo → 1", () => {
  const d = parseDate("2026-03-01");
  assert.equal(diffDays(d, d, true), 1);
});

test("diffDays exactamente un año", () => {
  const start = parseDate("2025-01-01");
  const end = parseDate("2026-01-01");
  assert.equal(diffDays(start, end), 365);
});

test("diffDays es estable al cruzar un cambio de horario", () => {
  assert.equal(diffDays(parseDate("2026-03-01"), parseDate("2026-04-01")), 31);
});

test("diffDays extremos invertidos → 0 (nunca negativo)", () => {
  const a = parseDate("2026-06-01");
  const b = parseDate("2026-01-01");
  assert.equal(diffDays(a, b), 0);
});

// ---------------------------------------------------------------------------
// fullYears
// ---------------------------------------------------------------------------
test("fullYears menos de un año → 0", () => {
  assert.equal(fullYears(parseDate("2026-01-01"), parseDate("2026-06-15")), 0);
});

test("fullYears exactamente 1 año", () => {
  assert.equal(fullYears(parseDate("2022-03-14"), parseDate("2023-03-14")), 1);
});

test("fullYears aniversario no cumplido aún → años − 1", () => {
  // Ingresó el 15 de marzo, baja el 14 de marzo del siguiente año → 0 años
  assert.equal(fullYears(parseDate("2025-03-15"), parseDate("2026-03-14")), 0);
});

test("fullYears 4 años completos", () => {
  assert.equal(fullYears(parseDate("2022-03-14"), parseDate("2026-03-14")), 4);
});

// ---------------------------------------------------------------------------
// vacationDaysForYear — LFT Art. 76 (reforma 2024)
// ---------------------------------------------------------------------------
const vacationTable: [number, number][] = [
  [1, 12],
  [2, 14],
  [3, 16],
  [4, 18],
  [5, 20],
  [6, 22],
  [10, 22],
  [11, 24],
  [15, 24],
  [16, 26],
  [20, 26],
  [21, 28],
];

for (const [year, expected] of vacationTable) {
  test(`vacationDaysForYear(${year}) → ${expected} días`, () => {
    assert.equal(vacationDaysForYear(year), expected);
  });
}

// ---------------------------------------------------------------------------
// calculateAguinaldoDays
// ---------------------------------------------------------------------------
test("aguinaldo proporcional: trabajó todo el año, 15 días contratados, 0 pagados", () => {
  const start = parseDate("2026-01-01");
  const end = parseDate("2026-12-31");
  const form = { aguinaldoDays: 15, aguinaldoPaidDays: 0 };
  const days = calculateAguinaldoDays(form, start, end, true);
  // ~365/365 × 15 ≈ 15
  assert.ok(days >= 14.9 && days <= 15.1, `Esperaba ~15, obtuvo ${days}`);
});

test("aguinaldo: ya pagó los 15 días → 0 pendientes", () => {
  const start = parseDate("2026-01-01");
  const end = parseDate("2026-12-31");
  const form = { aguinaldoDays: 15, aguinaldoPaidDays: 15 };
  const days = calculateAguinaldoDays(form, start, end, true);
  assert.ok(days <= 0.1, `Esperaba 0, obtuvo ${days}`);
});

test("aguinaldo: fechas inválidas → 0", () => {
  const d = parseDate("2026-01-01");
  const form = { aguinaldoDays: 15, aguinaldoPaidDays: 0 };
  assert.equal(calculateAguinaldoDays(form, d, d, false), 0);
});

test("aguinaldo proporcional usa 366 días en año bisiesto", () => {
  const form = { aguinaldoDays: 15, aguinaldoPaidDays: 0 };
  const days = calculateAguinaldoDays(
    form,
    parseDate("2024-01-01"),
    parseDate("2024-12-31"),
    true,
  );
  assert.ok(Math.abs(days - 15) < 0.0001, `Esperaba 15, obtuvo ${days}`);
});

// ---------------------------------------------------------------------------
// calculateIntegrationFactor
// ---------------------------------------------------------------------------
test("factor de integración: aguinaldo 15 días, 12 vacaciones, prima 25%", () => {
  const factor = calculateIntegrationFactor(15, 12, 25);
  // 1 + 15/365 + (12 × 0.25)/365 ≈ 1.0493
  const expected = 1 + 15 / 365 + (12 * 0.25) / 365;
  assert.ok(
    Math.abs(factor - expected) < 0.0001,
    `Esperaba ${expected}, obtuvo ${factor}`,
  );
});

test("factor de integración sin extras → 1", () => {
  assert.equal(calculateIntegrationFactor(0, 0, 0), 1);
});

// ---------------------------------------------------------------------------
// calculateVacations
// ---------------------------------------------------------------------------
test("vacaciones: primer año completo, sin gozar ni acumular", () => {
  const start = parseDate("2026-01-01");
  const end = parseDate("2026-12-31");
  const { annualVacationDays, payableVacationDays } = calculateVacations(
    { vacationTaken: 0, accruedVacationDays: 0 },
    start,
    end,
    true,
    0,
  );
  assert.equal(annualVacationDays, 12);
  assert.ok(payableVacationDays > 11.8, `Esperaba ~12, obtuvo ${payableVacationDays}`);
});

test("vacaciones: si gozó más de los generados → 0 por pagar", () => {
  const start = parseDate("2026-01-01");
  const end = parseDate("2026-03-31");
  const { payableVacationDays } = calculateVacations(
    { vacationTaken: 12, accruedVacationDays: 0 },
    start,
    end,
    true,
    0,
  );
  assert.equal(payableVacationDays, 0);
});

// ---------------------------------------------------------------------------
// calculate — smoke tests del resultado completo
// ---------------------------------------------------------------------------
const baseForm: FormState = {
  employee: "Test",
  company: "Empresa Test",
  exitType: "renuncia",
  workZone: "general",
  startDate: "2022-01-01",
  endDate: "2026-01-01",
  monthlySalary: 15000,
  pendingSalaryDays: 5,
  aguinaldoDays: 15,
  aguinaldoPaidDays: 0,
  vacationPremium: 25,
  vacationTaken: 0,
  accruedVacationDays: 0,
  commissions: 0,
  ptu: 0,
  otherEarnings: 0,
  includeTwentyDays: false,
  isr: 0,
  imss: 0,
  infonavit: 0,
  otherDeductions: 0,
};

test("calculate: renuncia sin deducciones → neto === bruto", () => {
  const result = calculate(baseForm);
  assert.ok(result.validDates);
  assert.equal(result.deductions, 0);
  assert.equal(result.net, result.gross);
  assert.ok(result.gross > 0);
});

test("calculate: renuncia con < 15 años → sin liquidación", () => {
  const result = calculate(baseForm);
  assert.equal(result.liquidation, 0);
});

test("calculate: despido injustificado → tiene indemnización constitucional", () => {
  const form: FormState = { ...baseForm, exitType: "despido-injustificado" };
  const result = calculate(form);
  const threeMonths = result.items.find((i) => i.key === "three-months");
  assert.ok(threeMonths && threeMonths.amount > 0);
});

test("calculate: fechas inválidas → validDates = false, sin prestaciones de fecha", () => {
  // Con fechas inválidas los campos de fechas (vacaciones, aguinaldo, liquidación)
  // son 0, pero los campos manuales (pendingSalaryDays, commissions, etc.) sí aplican
  // porque el usuario los capturó explícitamente.
  const form: FormState = {
    ...baseForm,
    pendingSalaryDays: 0, // sin entradas manuales para aislar el efecto de fechas
    startDate: "2026-01-01",
    endDate: "2025-01-01",
  };
  const result = calculate(form);
  assert.equal(result.validDates, false);
  assert.equal(result.liquidation, 0);
  assert.equal(result.net, 0);
  // vacaciones y aguinaldo devengados deben ser 0
  assert.equal(result.items.find((i) => i.key === "vacation")?.amount, 0);
  assert.equal(result.items.find((i) => i.key === "aguinaldo")?.amount, 0);
});

test("calculate: un despido con fechas inválidas no genera indemnización", () => {
  const form: FormState = {
    ...baseForm,
    exitType: "despido-injustificado",
    startDate: "2026-06-01",
    endDate: "2026-01-01",
  };
  const result = calculate(form);
  assert.equal(result.validDates, false);
  assert.equal(result.liquidation, 0);
});

test("calculate: la zona fronteriza ajusta el tope de prima de antigüedad", () => {
  const common: FormState = {
    ...baseForm,
    exitType: "despido-injustificado",
    monthlySalary: 30_000,
  };
  const general = calculate({ ...common, workZone: "general" });
  const border = calculate({ ...common, workZone: "north-border" });

  assert.ok(border.minimumWage > general.minimumWage);
  assert.ok(
    (border.items.find((item) => item.key === "seniority")?.amount ?? 0) >
      (general.items.find((item) => item.key === "seniority")?.amount ?? 0),
  );
});

test("calculate: salario negativo se trata como 0", () => {
  const form: FormState = { ...baseForm, monthlySalary: -5000 };
  const result = calculate(form);
  assert.equal(result.dailySalary, 0);
  assert.equal(result.net, 0);
});

test("calculate: valores no finitos se tratan como 0", () => {
  const result = calculate({ ...baseForm, monthlySalary: Number.POSITIVE_INFINITY });
  assert.equal(result.dailySalary, 0);
  assert.equal(result.net, 0);
});

test("calculate: deducción mayor al bruto → neto = 0 (nunca negativo)", () => {
  const form: FormState = { ...baseForm, isr: 9_999_999 };
  const result = calculate(form);
  assert.equal(result.net, 0);
});
