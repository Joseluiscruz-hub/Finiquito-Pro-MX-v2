import assert from "node:assert/strict";
import test from "node:test";

import {
  BATCH_TEMPLATE_HEADERS,
  buildBatchSummaryCsv,
  buildBatchTemplateCsv,
  parseBatchCsv,
} from "../app/lib/batch";
import { initialForm } from "../app/lib/constants";

test("buildBatchTemplateCsv incluye encabezados de plantilla", () => {
  const csv = buildBatchTemplateCsv();
  for (const header of BATCH_TEMPLATE_HEADERS) {
    assert.match(csv, new RegExp(header));
  }
  assert.match(csv, /María López Hernández|Maria Lopez Hernandez/);
});

test("parseBatchCsv calcula dos filas y acepta labels de causa/zona", () => {
  const csv = [
    BATCH_TEMPLATE_HEADERS.join(","),
    [
      "Ana Pérez",
      "PEXA900101ABC",
      "Acme SA",
      "ACM010101AA1",
      "Calle 1",
      "CDMX",
      "RH",
      "RH-0001",
      "Despido injustificado",
      "Resto del país",
      "2020-01-15",
      "2026-08-01",
      "20000",
      "5",
      "15",
      "0",
      "25",
      "0",
      "0",
      "0",
      "0",
      "0",
      "no",
      "0",
      "0",
      "0",
      "0",
    ].join(","),
    [
      "Luis Soto",
      "SOLU880202XYZ",
      "Acme SA",
      "ACM010101AA1",
      "Calle 1",
      "CDMX",
      "RH",
      "RH-0002",
      "renuncia",
      "north-border",
      "2023-06-01",
      "2026-08-01",
      "18000",
      "0",
      "15",
      "0",
      "25",
      "0",
      "0",
      "0",
      "0",
      "0",
      "si",
      "100",
      "50",
      "0",
      "0",
    ].join(","),
  ].join("\n");

  const rows = parseBatchCsv(csv);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].form.employee, "Ana Pérez");
  assert.equal(rows[0].form.exitType, "despido-injustificado");
  assert.equal(rows[0].form.workZone, "general");
  assert.equal(rows[0].status, "ok");
  assert.ok(rows[0].result.net > 0);
  assert.equal(rows[1].form.exitType, "renuncia");
  assert.equal(rows[1].form.workZone, "north-border");
  assert.equal(rows[1].form.includeTwentyDays, true);
});

test("buildBatchSummaryCsv neutraliza fórmulas inyectadas", () => {
  const malicious = parseBatchCsv(
    [
      "trabajador,empresa,causa,zona,fecha_ingreso,fecha_baja,salario_mensual",
      `"=HYPERLINK(""https://example.test"")","+CMD","renuncia","general","${initialForm.startDate}","${initialForm.endDate}","10000"`,
    ].join("\n"),
  );
  const csv = buildBatchSummaryCsv(malicious);
  assert.match(csv, /"'=HYPERLINK/);
  assert.match(csv, /"'\+CMD"/);
  assert.doesNotMatch(csv, /,"=HYPERLINK/);
});

test("parseBatchCsv marca fechas inválidas sin tumbar el lote", () => {
  const csv = [
    "trabajador,fecha_ingreso,fecha_baja,salario_mensual,causa",
    "Persona X,2026-08-01,2020-01-01,12000,renuncia",
  ].join("\n");
  const rows = parseBatchCsv(csv);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, "invalid-dates");
  assert.equal(rows[0].result.validDates, false);
});
