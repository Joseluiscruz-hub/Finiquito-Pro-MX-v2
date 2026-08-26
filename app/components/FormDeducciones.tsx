"use client";

import type { FormStepProps } from "../types/finiquito";
import { NumberField } from "./NumberField";

export function FormDeducciones({ id, form, update }: FormStepProps) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={id.replace("panel", "tab")}
      className="form-section"
    >
      <div className="section-heading">
        <div>
          <span className="section-number" aria-hidden="true">03</span>
          <h2>Retenciones y deducciones</h2>
        </div>
        <p>Usa los importes determinados por nómina para evitar una falsa precisión fiscal.</p>
      </div>

      <div className="notice amber" role="note">
        <strong>Control fiscal responsable</strong>
        <span>
          ISR, IMSS e Infonavit dependen de bases, exenciones, periodicidad, crédito y
          acumulados. Captura aquí la retención validada por nómina.
        </span>
      </div>

      <div className="form-grid two">
        <NumberField
          label="ISR retenido"
          value={form.isr}
          onChange={(v) => update("isr", v)}
          prefix="$"
        />
        <NumberField
          label="Cuota obrera IMSS"
          value={form.imss}
          onChange={(v) => update("imss", v)}
          prefix="$"
        />
        <NumberField
          label="Amortización Infonavit"
          value={form.infonavit}
          onChange={(v) => update("infonavit", v)}
          prefix="$"
        />
        <NumberField
          label="Otras deducciones autorizadas"
          value={form.otherDeductions}
          onChange={(v) => update("otherDeductions", v)}
          prefix="$"
        />
      </div>
    </div>
  );
}
