"use client";

import type {
  CalculationResult,
  ExitType,
  FormStepProps,
  WorkZone,
} from "../types/finiquito";
import { exitLabels, workZoneLabels } from "../lib/constants";
import { decimal, money } from "../lib/formatters";
import { NumberField } from "./NumberField";

type Props = FormStepProps & {
  result: CalculationResult;
};

export function FormSeparacion({ id, form, result, update }: Props) {
  const tabId = id.replace("panel", "tab");

  return (
    <div id={id} role="tabpanel" aria-labelledby={tabId} className="form-section">
      <div className="section-heading">
        <div>
          <span className="section-number" aria-hidden="true">01</span>
          <h2>Datos de la separación</h2>
        </div>
        <p>Los campos principales definen el escenario legal.</p>
      </div>

      <div className="form-grid two">
        <label className="field">
          <span className="field-label">Nombre del trabajador</span>
          <input
            value={form.employee}
            autoComplete="off"
            onChange={(e) => update("employee", e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Empresa</span>
          <input
            value={form.company}
            autoComplete="off"
            onChange={(e) => update("company", e.target.value)}
          />
        </label>
      </div>

      <div className="form-grid two">
        <label className="field">
          <span className="field-label">¿Cómo terminó la relación laboral?</span>
          <select
            value={form.exitType}
            onChange={(e) => update("exitType", e.target.value as ExitType)}
          >
            {Object.entries(exitLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <small>La causa define las indemnizaciones que podrían corresponder.</small>
        </label>

        <label className="field">
          <span className="field-label">Zona del centro de trabajo</span>
          <select
            value={form.workZone}
            onChange={(e) => update("workZone", e.target.value as WorkZone)}
          >
            {Object.entries(workZoneLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <small>Ajusta el tope salarial de la prima de antigüedad.</small>
        </label>
      </div>

      <div className="form-grid three">
        <label className="field">
          <span className="field-label">Fecha de ingreso</span>
          <input
            type="date"
            value={form.startDate}
            aria-invalid={!result.validDates}
            aria-describedby={!result.validDates ? "date-validation" : undefined}
            onChange={(e) => update("startDate", e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Fecha de baja</span>
          <input
            type="date"
            value={form.endDate}
            aria-invalid={!result.validDates}
            aria-describedby={!result.validDates ? "date-validation" : undefined}
            onChange={(e) => update("endDate", e.target.value)}
          />
        </label>
        <NumberField
          id="monthly-salary"
          label="Salario mensual bruto"
          value={form.monthlySalary}
          onChange={(v) => update("monthlySalary", v)}
          prefix="$"
        />
      </div>

      {!result.validDates && (
        <div id="date-validation" role="alert" className="validation-error">
          Captura fechas válidas; la baja no puede ser anterior al ingreso.
        </div>
      )}

      <div className="calculation-glance" aria-label="Resumen rápido">
        <div>
          <span>Antigüedad calculada</span>
          <strong>{decimal(result.serviceYears, 2)} años</strong>
        </div>
        <div>
          <span>Salario diario</span>
          <strong>{money.format(result.dailySalary)}</strong>
        </div>
        <div>
          <span>Salario diario integrado</span>
          <strong>{money.format(result.integratedDailySalary)}</strong>
        </div>
      </div>
    </div>
  );
}
