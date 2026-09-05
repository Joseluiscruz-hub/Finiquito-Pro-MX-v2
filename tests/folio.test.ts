import assert from "node:assert/strict";
import test from "node:test";

import { initialForm } from "../app/lib/constants";
import { documentFolio, normalizeFolio } from "../app/lib/folio";
import { formatLongDate } from "../app/lib/formatters";

test("documentFolio es determinista y usa la fecha de baja", () => {
  const first = documentFolio(initialForm);
  const second = documentFolio(initialForm);
  assert.equal(first, second);
  assert.match(first, /^FP-20260823-[A-Z0-9]{4}$/);
});

test("documentFolio respeta un folio capturado", () => {
  assert.equal(documentFolio({ ...initialForm, folio: "rh-0007" }), "RH-0007");
});

test("normalizeFolio limpia espacios y símbolos", () => {
  assert.equal(normalizeFolio("  rh 00/07  "), "RH-0007");
});

test("formatLongDate no desplaza el día por zona horaria", () => {
  assert.equal(formatLongDate("2026-08-23"), "23 de agosto de 2026");
});
