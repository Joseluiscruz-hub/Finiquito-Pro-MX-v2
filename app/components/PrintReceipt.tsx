import type { CalculationResult, FormState, LineItemGroup } from "../types/finiquito";
import { exitLabels, workZoneLabels } from "../lib/constants";
import { documentFolio } from "../lib/folio";
import { decimal, formatLongDate, money } from "../lib/formatters";

type Props = {
  form: FormState;
  result: CalculationResult;
};

const GROUP_LABEL: Record<LineItemGroup, string> = {
  finiquito: "Finiquito",
  liquidacion: "Liquidación",
  deduccion: "Deducciones",
};

/**
 * Recibo A4 membretado. Se oculta en pantalla y el navegador lo materializa
 * al imprimir o guardar como PDF.
 */
export function PrintReceipt({ form, result }: Props) {
  const folio = documentFolio(form);
  const city = form.documentCity.trim() || "México";
  const issuedOn = formatLongDate(form.endDate);
  const period = `${formatLongDate(form.startDate)} al ${formatLongDate(form.endDate)}`;
  const groups: LineItemGroup[] = ["finiquito", "liquidacion", "deduccion"];

  return (
    <aside className="print-only receipt" aria-hidden="true">
      <header className="receipt-letterhead">
        <div className="receipt-issuer">
          <strong>{form.company || "Empresa"}</strong>
          {form.companyRfc ? <p>RFC {form.companyRfc}</p> : null}
          {form.companyAddress ? <p>{form.companyAddress}</p> : null}
        </div>
        <div className="receipt-brand">
          <span className="receipt-mark">FP</span>
          <div>
            <strong>Finiquito Pro MX</strong>
            <p>Control interno de separación laboral</p>
          </div>
        </div>
      </header>

      <div className="receipt-title-row">
        <div>
          <p className="receipt-kicker">Documento de control interno</p>
          <h1>Recibo estimado de finiquito y liquidación</h1>
        </div>
        <dl className="receipt-ids">
          <div>
            <dt>Folio</dt>
            <dd>{folio}</dd>
          </div>
          <div>
            <dt>Fecha de baja</dt>
            <dd>{issuedOn}</dd>
          </div>
        </dl>
      </div>

      <section className="receipt-meta" aria-label="Partes y condiciones">
        <div>
          <span>Trabajador</span>
          <strong>{form.employee || "—"}</strong>
          {form.employeeRfc ? <small>RFC {form.employeeRfc}</small> : null}
        </div>
        <div>
          <span>Causa</span>
          <strong>{exitLabels[form.exitType]}</strong>
          <small>{workZoneLabels[form.workZone]}</small>
        </div>
        <div>
          <span>Periodo de servicio</span>
          <strong>{period}</strong>
          <small>{decimal(result.serviceYears, 2)} años de antigüedad</small>
        </div>
        <div>
          <span>Salario mensual bruto</span>
          <strong>{money.format(form.monthlySalary)}</strong>
          <small>
            Diario {money.format(result.dailySalary)} · SDI {money.format(result.integratedDailySalary)}
          </small>
        </div>
      </section>

      {groups.map((group) => {
        const rows = result.items.filter((item) => item.group === group && item.amount > 0);
        if (rows.length === 0) return null;
        const total =
          group === "finiquito"
            ? result.finiquito
            : group === "liquidacion"
              ? result.liquidation
              : result.deductions;
        return (
          <table key={group} className="receipt-table">
            <caption>{GROUP_LABEL[group]}</caption>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Fórmula / fundamento</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.key}>
                  <td>
                    {item.label}
                    {item.legal ? <small>{item.legal}</small> : null}
                  </td>
                  <td>{item.formula}</td>
                  <td>
                    {item.group === "deduccion" ? "− " : ""}
                    {money.format(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={2}>Subtotal {GROUP_LABEL[group].toLowerCase()}</th>
                <th>
                  {group === "deduccion" ? "− " : ""}
                  {money.format(total)}
                </th>
              </tr>
            </tfoot>
          </table>
        );
      })}

      <section className="receipt-totals">
        <div>
          <span>Bruto</span>
          <strong>{money.format(result.gross)}</strong>
        </div>
        <div>
          <span>Deducciones</span>
          <strong>− {money.format(result.deductions)}</strong>
        </div>
        <div className="receipt-net">
          <span>Neto estimado a pagar</span>
          <strong>{money.format(result.net)}</strong>
        </div>
      </section>

      <p className="receipt-note">
        Documento informativo emitido en {city} con folio {folio}. Sirve para revisión
        interna de nómina, RR. HH. o asesoría. No es constancia oficial, convenio
        ratificado ni resolución de autoridad laboral o fiscal. Los importes de ISR,
        IMSS e Infonavit corresponden a lo capturado por el usuario.
      </p>

      <div className="signature-row">
        <div>
          <span />
          <strong>Trabajador</strong>
          <small>{form.employee || "Nombre y firma"}</small>
        </div>
        <div>
          <span />
          <strong>Empresa</strong>
          <small>
            {form.preparedBy || "Área responsable"} · {form.company || "Razón social"}
          </small>
        </div>
      </div>

      <footer className="receipt-footer">
        Finiquito Pro MX · parámetros laborales 2026 · folio {folio}
      </footer>
    </aside>
  );
}
