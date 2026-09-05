import type { ExitType, FormState, WorkZone } from "../types/finiquito";

/** Valor diario de la UMA 2026, vigente desde febrero de 2026. (INEGI) */
export const UMA_2026 = 117.31;

/** Salarios mínimos 2026, vigentes desde el 1 de enero. (CONASAMI) */
export const MINIMUM_WAGE_GENERAL_2026 = 315.04;
export const MINIMUM_WAGE_NORTH_BORDER_2026 = 440.87;

/** Clave de localStorage para persistir el borrador. */
export const DRAFT_STORAGE_KEY = "calculadora-laboral-mx-draft";

export const exitLabels: Record<ExitType, string> = {
  renuncia: "Renuncia voluntaria",
  "despido-injustificado": "Despido injustificado",
  "rescision-patron": "Rescisión imputable al patrón",
  "despido-justificado": "Despido justificado",
  "terminacion-contrato": "Terminación de contrato",
  "mutuo-acuerdo": "Mutuo acuerdo",
};

export const workZoneLabels: Record<WorkZone, string> = {
  general: "Resto del país",
  "north-border": "Zona Libre de la Frontera Norte",
};

/** Datos de ejemplo pre-cargados; se usan al restablecer el formulario. */
export const initialForm: FormState = {
  employee: "María López Hernández",
  employeeRfc: "LOHM900315MDF",
  company: "Empresa de ejemplo, S.A. de C.V.",
  companyRfc: "EEM010101AA1",
  companyAddress: "Av. Reforma 100, Ciudad de México",
  documentCity: "Ciudad de México",
  preparedBy: "Recursos Humanos",
  folio: "",
  exitType: "despido-injustificado",
  workZone: "general",
  startDate: "2022-03-14",
  endDate: "2026-08-23",
  monthlySalary: 18500,
  pendingSalaryDays: 7,
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
