import assert from "node:assert/strict";
import test from "node:test";

import { calculate } from "../app/lib/calculations";
import { initialForm } from "../app/lib/constants";
import {
  MAX_STORED_CASES,
  removeCase,
  sanitizeCases,
  serializeCases,
  upsertCase,
} from "../app/lib/cases";
import { documentFolio } from "../app/lib/folio";

test("upsertCase actualiza el mismo folio y lo deja primero", () => {
  const first = calculate(initialForm);
  const updatedForm = { ...initialForm, monthlySalary: 22000 };
  const second = calculate(updatedForm);
  const stored = upsertCase(upsertCase([], initialForm, first, "2026-09-01T00:00:00.000Z"), updatedForm, second, "2026-09-05T00:00:00.000Z");

  assert.equal(stored.length, 1);
  assert.equal(stored[0].folio, documentFolio(initialForm));
  assert.equal(stored[0].net, second.net);
  assert.equal(stored[0].form.monthlySalary, 22000);
});

test("sanitizeCases descarta entradas rotas y duplicados", () => {
  const form = initialForm;
  const result = calculate(form);
  const valid = upsertCase([], form, result, "2026-09-05T12:00:00.000Z")[0];
  const cleaned = sanitizeCases({
    version: 1,
    cases: [valid, { folio: valid.folio, form }, null, 12, { employee: "x" }],
  });

  assert.equal(cleaned.length, 1);
  assert.equal(cleaned[0].folio, valid.folio);
});

test("serializeCases restaura un sobre versionado", () => {
  const result = calculate(initialForm);
  const stored = upsertCase([], initialForm, result, "2026-09-05T12:00:00.000Z");
  const restored = sanitizeCases(JSON.parse(serializeCases(stored)));
  assert.equal(restored[0].folio, stored[0].folio);
  assert.equal(restored[0].form.employee, initialForm.employee);
});

test("removeCase quita por id y upsertCase respeta el tope", () => {
  const result = calculate(initialForm);
  const one = upsertCase([], initialForm, result);
  assert.equal(removeCase(one, one[0].id).length, 0);

  let many = [] as ReturnType<typeof upsertCase>;
  for (let index = 0; index < MAX_STORED_CASES + 5; index += 1) {
    const form = { ...initialForm, employee: `Persona ${index}`, folio: `RH-${String(index).padStart(4, "0")}` };
    many = upsertCase(many, form, calculate(form), `2026-09-05T00:00:0${index % 10}.000Z`);
  }
  assert.equal(many.length, MAX_STORED_CASES);
});
