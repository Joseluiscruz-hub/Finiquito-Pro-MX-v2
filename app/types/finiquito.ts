export type ExitType =
  | "renuncia"
  | "despido-injustificado"
  | "rescision-patron"
  | "despido-justificado"
  | "terminacion-contrato"
  | "mutuo-acuerdo";

export type WorkZone = "general" | "north-border";

export type LineItemGroup = "finiquito" | "liquidacion" | "deduccion";

export type LineItem = {
  key: string;
  label: string;
  amount: number;
  formula: string;
  legal?: string;
  group: LineItemGroup;
};

export type FormState = {
  employee: string;
  company: string;
  exitType: ExitType;
  workZone: WorkZone;
  startDate: string;
  endDate: string;
  monthlySalary: number;
  pendingSalaryDays: number;
  aguinaldoDays: number;
  aguinaldoPaidDays: number;
  vacationPremium: number;
  vacationTaken: number;
  accruedVacationDays: number;
  commissions: number;
  ptu: number;
  otherEarnings: number;
  includeTwentyDays: boolean;
  isr: number;
  imss: number;
  infonavit: number;
  otherDeductions: number;
};

export type CalculationResult = {
  validDates: boolean;
  minimumWage: number;
  dailySalary: number;
  integratedDailySalary: number;
  daysWorked: number;
  years: number;
  serviceYears: number;
  annualVacationDays: number;
  proportionalVacationDays: number;
  payableVacationDays: number;
  accruedAguinaldoDays: number;
  items: LineItem[];
  finiquito: number;
  liquidation: number;
  deductions: number;
  uncoveredDeductions: number;
  gross: number;
  net: number;
};

/** Props shared by all three form-step components. */
export type FormStepProps = {
  id: string;
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};
