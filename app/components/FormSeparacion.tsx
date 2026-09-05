"use client";

import type {
  CalculationResult,
  ExitType,
  FormStepProps,
  WorkZone,
} from "../types/finiquito";
import { exitLabels, workZoneLabels } from "../lib/constants";
import { documentFolio } from "../lib/folio";
import { decimal, money } from "../lib/formatters";
import { NumberField } from "./NumberField";

type Props = FormStepProps & {
  result: CalculationResult;
};

export function FormSeparacion({ id, form, result, update }: Props) {
  const tabId = id.replace("panel", "tab");
  const previewFolio = documentFolio(form);

  return (
    <div id={id} role="tabpanel" aria-labelledby={tabId} className="form-section">
      <div className="section-heading">
        <div>
          <span className="section-number" aria-hidden="true">01</span>
          <h2>Datos de la separación</h2>
        </div>
        <p>Identidad laboral y datos que viajan al recibo membretado.</p>
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
          <span className="field-label">RFC del trabajador</span>
          <input
            value={form.employeeRfc}
            autoComplete="off"
            spellCheck={false}
            maxLength={13}
            placeholder="Opcional"
            onChange={(e) => update("employeeRfc", e.target.value.toUpperCase())}
          />
        </label>
      </div>

      <div className="form-grid two">
        <label className="field">
          <span className="field-label">Empresa</span>
          <input
            value={form.company}
            autoComplete="off"
            onChange={(e) => update("company", e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">RFC de la empresa</span>
          <input
            value={form.companyRfc}
            autoComplete="off"
            spellCheck={false}
            maxLength={13}
            placeholder="Opcional"
            onChange={(e) => update("companyRfc", e.target.value.toUpperCase())}
          />
        </label>
      </div>

      <label className="field">
        <span className="field-label">Domicilio de la empresa</span>
        <input
          value={form.companyAddress}
          autoComplete="off"
          placeholder="Calle, colonia, ciudad"
          onChange={(e) => update("companyAddress", e.target.value)}
        />
      </label>

      <div className="form-grid three">
        <label className="field">
          <span className="field-label">Ciudad del documento</span>
          <input
            value={form.documentCity}
            autoComplete="off"
            onChange={(e) => update("documentCity", e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Elaboró</span>
          <input
            value={form.preparedBy}
            autoComplete="off"
            placeholder="Recursos Humanos"
            onChange={(e) => update("preparedBy", e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Folio interno</span>
          <input
            value={form.folio}
            autoComplete="off"
            spellCheck={false}
            maxLength={24}
            placeholder={previewFolio}
            onChange={(e) => update("folio", e.target.value.toUpperCase())}
          />
          <small>Si lo dejas vacío se genera {previewFolio}.</small>
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
