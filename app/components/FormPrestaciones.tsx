"use client";

import type { CalculationResult, FormStepProps } from "../types/finiquito";
import { decimal } from "../lib/formatters";
import { NumberField } from "./NumberField";

type Props = FormStepProps & {
  result: CalculationResult;
};

export function FormPrestaciones({ id, form, result, update }: Props) {
  const showTwentyDays =
    form.exitType === "despido-injustificado" || form.exitType === "rescision-patron";

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={id.replace("panel", "tab")}
      className="form-section"
    >
      <div className="section-heading">
        <div>
          <span className="section-number" aria-hidden="true">02</span>
          <h2>Prestaciones pendientes</h2>
        </div>
        <p>Ajusta contrato, días gozados y percepciones variables.</p>
      </div>

      <div className="form-grid three">
        <NumberField
          label="Días de sueldo pendientes"
          value={form.pendingSalaryDays}
          onChange={(v) => update("pendingSalaryDays", v)}
          step="1"
          suffix="días"
        />
        <NumberField
          label="Aguinaldo anual"
          value={form.aguinaldoDays}
          onChange={(v) => update("aguinaldoDays", v)}
          step="1"
          suffix="días"
        />
        <NumberField
          label="Aguinaldo ya pagado este año"
          value={form.aguinaldoPaidDays}
          onChange={(v) => update("aguinaldoPaidDays", v)}
          suffix="días"
        />
        <NumberField
          label="Prima vacacional"
          value={form.vacationPremium}
          onChange={(v) => update("vacationPremium", v)}
          suffix="%"
        />
        <NumberField
          label="Vacaciones gozadas del ciclo"
          value={form.vacationTaken}
          onChange={(v) => update("vacationTaken", v)}
          suffix="días"
        />
        <NumberField
          label="Vacaciones pendientes anteriores"
          value={form.accruedVacationDays}
          onChange={(v) => update("accruedVacationDays", v)}
          suffix="días"
        />
      </div>

      <div className="vacation-note" aria-live="polite">
        <strong>Ciclo detectado: año {Math.max(1, result.years + 1)}</strong>
        <span>
          {result.annualVacationDays} días anuales ·{" "}
          {decimal(result.proportionalVacationDays)} generados ·{" "}
          {decimal(result.payableVacationDays)} por pagar
        </span>
      </div>

      <div className="form-grid three">
        <NumberField
          label="Comisiones y bonos"
          value={form.commissions}
          onChange={(v) => update("commissions", v)}
          prefix="$"
        />
        <NumberField
          label="PTU pendiente"
          value={form.ptu}
          onChange={(v) => update("ptu", v)}
          prefix="$"
        />
        <NumberField
          label="Otras percepciones"
          value={form.otherEarnings}
          onChange={(v) => update("otherEarnings", v)}
          prefix="$"
        />
      </div>

      {showTwentyDays && (
        <label className="switch-row">
          <span>
            <strong>Incluir 20 días por año</strong>
            <small>
              No procede automáticamente en todo despido; debe corresponder al supuesto
              legal o convenio.
            </small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={form.includeTwentyDays}
            aria-label="Incluir 20 días por año de antigüedad en la liquidación"
            onChange={(e) => update("includeTwentyDays", e.target.checked)}
          />
        </label>
      )}
    </div>
  );
}
