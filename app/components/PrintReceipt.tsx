import type { CalculationResult, FormState } from "../types/finiquito";
import { exitLabels } from "../lib/constants";
import { money } from "../lib/formatters";

type Props = {
  form: FormState;
  result: CalculationResult;
};

/**
 * Bloque oculto en pantalla que el navegador renderiza al imprimir.
 * Es un Server Component (sin interactividad), por lo que no lleva "use client".
 */
export function PrintReceipt({ form, result }: Props) {
  const today = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <aside className="print-only receipt" aria-hidden="true">
      <h1>RECIBO ESTIMADO DE FINIQUITO Y LIQUIDACIÓN</h1>
      <p><strong>Trabajador:</strong> {form.employee}</p>
      <p><strong>Empresa:</strong> {form.company}</p>
      <p><strong>Causa:</strong> {exitLabels[form.exitType]}</p>
      <p><strong>Periodo:</strong> {form.startDate} al {form.endDate}</p>

      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Fórmula</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {result.items
            .filter((item) => item.amount > 0)
            .map((item) => (
              <tr key={item.key}>
                <td>
                  {item.label}
                  {item.legal && <small>{item.legal}</small>}
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
            <th colSpan={2}>Neto estimado</th>
            <th>{money.format(result.net)}</th>
          </tr>
        </tfoot>
      </table>

      <p className="receipt-note">
        Documento informativo generado el {today}. Requiere validación de nómina y, en
        su caso, asesoría laboral/fiscal.
      </p>
      <div className="signature-row">
        <span>Firma del trabajador</span>
        <span>Firma de la empresa</span>
      </div>
    </aside>
  );
}
