"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { CalculationResult, FormState } from "../types/finiquito";
import { exitLabels } from "../lib/constants";
import {
  MAX_BATCH_ROWS,
  buildBatchSummaryCsv,
  buildBatchTemplateCsv,
  downloadTextFile,
  parseBatchCsv,
  type BatchRow,
} from "../lib/batch";
import { money } from "../lib/formatters";

type Props = {
  onOpen: (form: FormState) => void;
  onSave: (form: FormState, result: CalculationResult) => void;
};

export function BatchCsv({ onOpen, onSave }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const summary = useMemo(() => {
    const ok = rows.filter((row) => row.status === "ok").length;
    const invalid = rows.filter((row) => row.status === "invalid-dates").length;
    const failed = rows.filter((row) => row.status === "error").length;
    return { ok, invalid, failed, total: rows.length };
  }, [rows]);

  const handleTemplate = useCallback(() => {
    downloadTextFile("finiquito-pro-plantilla-lote.csv", buildBatchTemplateCsv());
  }, []);

  const handleClear = useCallback(() => {
    setRows([]);
    setError(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleExport = useCallback(() => {
    if (rows.length === 0) return;
    downloadTextFile("finiquito-pro-lote-resultados.csv", buildBatchSummaryCsv(rows));
  }, [rows]);

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseBatchCsv(text);
      if (parsed.length === 0) {
        setRows([]);
        setError("El CSV no tiene filas de datos o le faltan encabezados.");
        setFileName(file.name);
        return;
      }
      setRows(parsed);
      setError(
        parsed.length >= MAX_BATCH_ROWS
          ? `Se procesaron las primeras ${MAX_BATCH_ROWS} filas.`
          : null,
      );
      setFileName(file.name);
    } catch {
      setRows([]);
      setError("No se pudo leer el archivo CSV.");
      setFileName(file.name);
    }
  }, []);

  return (
    <section className="batch-csv" id="lote" aria-label="Lote CSV">
      <div className="batch-csv-heading">
        <div>
          <p className="eyebrow">Nómina en lote</p>
          <h2>Importar CSV de trabajadores</h2>
        </div>
        <p>Hasta {MAX_BATCH_ROWS} filas · todo local</p>
      </div>

      <div className="batch-csv-actions">
        <button type="button" className="ghost-button" onClick={handleTemplate}>
          Descargar plantilla
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => inputRef.current?.click()}
        >
          Elegir CSV
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={handleExport}
          disabled={rows.length === 0}
        >
          Exportar resultados
        </button>
        <button
          type="button"
          className="text-button"
          onClick={handleClear}
          disabled={rows.length === 0 && !fileName}
        >
          Limpiar
        </button>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {fileName ? <p className="batch-csv-file">Archivo: {fileName}</p> : null}
      {error ? <p className="batch-csv-error" role="status">{error}</p> : null}

      {rows.length > 0 ? (
        <>
          <div className="batch-csv-summary" aria-label="Resumen del lote">
            <span><strong>{summary.total}</strong> filas</span>
            <span><strong>{summary.ok}</strong> válidas</span>
            <span><strong>{summary.invalid}</strong> fechas</span>
            <span><strong>{summary.failed}</strong> error</span>
          </div>

          <div className="batch-csv-table-wrap">
            <table className="batch-csv-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Trabajador</th>
                  <th>Empresa</th>
                  <th>Causa</th>
                  <th>Neto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.folio}</td>
                    <td>{row.form.employee}</td>
                    <td>{row.form.company}</td>
                    <td>{exitLabels[row.form.exitType]}</td>
                    <td>{money.format(row.result.net)}</td>
                    <td>
                      <span className={`batch-status ${row.status}`}>
                        {row.status === "ok"
                          ? "OK"
                          : row.status === "invalid-dates"
                            ? "Fechas"
                            : "Error"}
                      </span>
                    </td>
                    <td>
                      <div className="batch-row-actions">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => onOpen(row.form)}
                        >
                          Abrir
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => onSave(row.form, row.result)}
                          disabled={!row.result.validDates}
                        >
                          Guardar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="batch-csv-empty">
          Descarga la plantilla, llena una fila por trabajador e importa el archivo.
          El cálculo no sale de este navegador.
        </p>
      )}
    </section>
  );
}
