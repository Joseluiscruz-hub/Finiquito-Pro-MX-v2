"use client";

import { useCallback } from "react";
import type { CalculationResult, FormState } from "../types/finiquito";
import { documentFolio } from "../lib/folio";
import { money } from "../lib/formatters";
import { exportCsv } from "../lib/export";

type Props = {
  form: FormState;
  result: CalculationResult;
  detailOpen: boolean;
  onToggleDetail: () => void;
};

export function ResultCard({ form, result, detailOpen, onToggleDetail }: Props) {
  const handleExport = useCallback(() => exportCsv(form, result), [form, result]);
  const handlePrint = useCallback(() => window.print(), []);
  const folio = documentFolio(form);

  const isLiquidation = result.liquidation > 0;

  return (
    <div className="result-card">
      <div className="result-topline">
        <span>Resultado estimado</span>
        <span className={isLiquidation ? "type-badge liquidation" : "type-badge"}>
          {isLiquidation ? "Finiquito + liquidación" : "Finiquito"}
        </span>
      </div>

      <p className="employee-name" title={form.employee || "Trabajador sin nombre"}>
        {form.employee || "Trabajador sin nombre"}
      </p>
      <p className="result-folio">
        Folio {folio}
        {form.companyRfc ? ` · RFC ${form.companyRfc}` : ""}
      </p>

      <div className="net-result">
        <small>Neto estimado a recibir</small>
        <strong aria-label={`${money.format(result.net)} pesos mexicanos`}>
          {money.format(result.net)}
        </strong>
        <span>MXN · después de deducciones capturadas</span>
      </div>

      <div className="summary-bars" aria-label="Desglose por grupo">
        <div>
          <span><i className="dot blue" aria-hidden="true" /> Finiquito</span>
          <strong>{money.format(result.finiquito)}</strong>
        </div>
        <div>
          <span><i className="dot purple" aria-hidden="true" /> Liquidación</span>
          <strong>{money.format(result.liquidation)}</strong>
        </div>
        <div>
          <span><i className="dot orange" aria-hidden="true" /> Deducciones</span>
          <strong>− {money.format(result.deductions)}</strong>
        </div>
      </div>

      <button
        className="detail-toggle"
        onClick={onToggleDetail}
        aria-expanded={detailOpen}
        aria-controls="line-items-list"
      >
        Desglose auditable{" "}
        <span aria-hidden="true">{detailOpen ? "−" : "+"}</span>
      </button>

      {detailOpen && (
        <ul id="line-items-list" className="line-items" aria-label="Conceptos del cálculo">
          {result.items
            .filter((item) => item.amount > 0)
            .map((item) => (
              <li key={item.key} className="line-item">
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.formula}</span>
                  {item.legal && <small>{item.legal}</small>}
                </div>
                <b className={item.group === "deduccion" ? "negative" : ""}>
                  {item.group === "deduccion" ? "− " : ""}
                  {money.format(item.amount)}
                </b>
              </li>
            ))}
        </ul>
      )}

      {!result.validDates && (
        <p className="result-warning" role="alert">
          Corrige las fechas para habilitar el recibo y la exportación.
        </p>
      )}

      {result.uncoveredDeductions > 0 && (
        <p className="result-warning" role="status">
          Las deducciones superan el total bruto por{" "}
          <strong>{money.format(result.uncoveredDeductions)}</strong>. Confirma esos
          importes con nómina.
        </p>
      )}

      <div className="result-actions">
        <button
          type="button"
          className="primary-button wide"
          onClick={handlePrint}
          disabled={!result.validDates}
        >
          Imprimir / PDF
        </button>
        <button
          type="button"
          className="ghost-button wide"
          onClick={handleExport}
          disabled={!result.validDates}
        >
          Exportar a Excel/CSV
        </button>
      </div>

      <p className="result-disclaimer">
        Estimación informativa. No sustituye revisión profesional ni resolución de
        autoridad laboral o fiscal.
      </p>
    </div>
  );
}
