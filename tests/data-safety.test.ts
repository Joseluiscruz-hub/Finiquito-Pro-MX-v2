import assert from "node:assert/strict";
import test from "node:test";

import { calculate } from "../app/lib/calculations";
import { initialForm } from "../app/lib/constants";
import { sanitizeDraft, serializeDraft } from "../app/lib/draft";
import { buildCsv, safeFileSlug } from "../app/lib/export";

test("sanitizeDraft conserva solo tipos y opciones permitidos", () => {
  const draft = sanitizeDraft({
    ...initialForm,
    employee: 99,
    exitType: "opcion-inventada",
    workZone: "otra-zona",
    monthlySalary: Number.POSITIVE_INFINITY,
  });

  assert.equal(draft.employee, initialForm.employee);
  assert.equal(draft.exitType, initialForm.exitType);
  assert.equal(draft.workZone, initialForm.workZone);
  assert.equal(draft.monthlySalary, initialForm.monthlySalary);
});

test("serializeDraft usa un sobre versionado que puede restaurarse", () => {
  const restored = sanitizeDraft(JSON.parse(serializeDraft(initialForm)));
  assert.deepEqual(restored, initialForm);
});

test("buildCsv neutraliza fórmulas inyectadas por datos capturados", () => {
  const form = {
    ...initialForm,
    employee: "=HYPERLINK(\"https://example.test\")",
    company: "+CMD",
  };
  const csv = buildCsv(form, calculate(form));

  assert.match(csv, /"'=HYPERLINK/);
  assert.match(csv, /"'\+CMD"/);
  assert.doesNotMatch(csv, /,"=HYPERLINK/);
});

test("safeFileSlug conserva nombres con acentos de forma portable", () => {
  assert.equal(safeFileSlug("María López"), "maria-lopez");
});
