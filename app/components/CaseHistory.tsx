"use client";

import type { FormState } from "../types/finiquito";
import { exitLabels } from "../lib/constants";
import type { StoredCase } from "../lib/cases";
import { formatLongDate, money } from "../lib/formatters";

type Props = {
  cases: StoredCase[];
  onOpen: (form: FormState) => void;
  onDelete: (id: string) => void;
};

export function CaseHistory({ cases, onOpen, onDelete }: Props) {
  return (
    <section className="case-history" id="historial" aria-label="Historial de casos">
      <div className="case-history-heading">
        <div>
          <p className="eyebrow">Control interno</p>
          <h2>Historial de este dispositivo</h2>
        </div>
        <p>{cases.length === 0 ? "Aún no hay casos guardados." : `${cases.length} caso${cases.length === 1 ? "" : "s"}`}</p>
      </div>

      {cases.length === 0 ? (
        <p className="case-history-empty">
          Guarda un cálculo para reabrirlo después, comparar o reimprimir el recibo.
          Los casos no salen de este navegador.
        </p>
      ) : (
        <ul className="case-list">
          {cases.map((item) => (
            <li key={item.id} className="case-row">
              <div>
                <strong>{item.employee || "Sin nombre"}</strong>
                <span>
                  {item.folio} · {exitLabels[item.exitType]} · baja {formatLongDate(item.endDate)}
                </span>
                <small>{item.company}</small>
              </div>
              <b>{money.format(item.net)}</b>
              <div className="case-row-actions">
                <button type="button" className="ghost-button" onClick={() => onOpen(item.form)}>
                  Abrir
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => onDelete(item.id)}
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
