"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FormDeducciones } from "./components/FormDeducciones";
import { FormPrestaciones } from "./components/FormPrestaciones";
import { FormSeparacion } from "./components/FormSeparacion";
import { PrintReceipt } from "./components/PrintReceipt";
import { ResultCard } from "./components/ResultCard";
import { useDraft } from "./hooks/useDraft";
import { calculate } from "./lib/calculations";
import {
  MINIMUM_WAGE_GENERAL_2026,
  MINIMUM_WAGE_NORTH_BORDER_2026,
  UMA_2026,
} from "./lib/constants";
import { money } from "./lib/formatters";

const STEPS = [
  { number: 1, label: "Separación" },
  { number: 2, label: "Prestaciones" },
  { number: 3, label: "Deducciones" },
] as const;

export default function Home() {
  const { form, update, saveDraft, resetForm, status } = useDraft();
  const [activeStep, setActiveStep] = useState(1);
  const [detailOpen, setDetailOpen] = useState(true);

  const result = useMemo(() => calculate(form), [form]);

  const handlePrev = useCallback(() => setActiveStep((s) => Math.max(1, s - 1)), []);
  const handleNext = useCallback(
    () => setActiveStep((s) => Math.min(STEPS.length, s + 1)),
    [],
  );
  const handleToggleDetail = useCallback(() => setDetailOpen((o) => !o), []);
  const handleStepKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (![
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ].includes(event.key)) return;

    event.preventDefault();
    const current = Number(event.currentTarget.dataset.step);
    const next =
      event.key === "Home"
        ? 1
        : event.key === "End"
          ? STEPS.length
          : ((current - 1 + (event.key === "ArrowRight" ? 1 : -1) + STEPS.length) %
                STEPS.length) +
            1;
    setActiveStep(next);
    window.requestAnimationFrame(() => document.getElementById(`step-tab-${next}`)?.focus());
  }, []);

  const saveLabel =
    status === "saved"
      ? "Borrador guardado"
      : status === "error"
        ? "No se pudo guardar"
        : "Guardar borrador";

  return (
    <>
      {/* Skip link para navegación con teclado */}
      <a className="skip-link" href="#calculadora">
        Ir al contenido principal
      </a>

      <main>
        {/* ── Topbar ───────────────────────────────────────── */}
        <header className="topbar">
          <a className="brand" href="#inicio" aria-label="Finiquito Pro MX — ir al inicio">
            <span className="brand-mark" aria-hidden="true">FP</span>
            <span>
              <strong>Finiquito</strong>
              <b>Pro MX</b>
            </span>
          </a>

          <nav aria-label="Navegación principal">
            <a className="active" href="#calculadora">Cálculo</a>
            <a href="#fundamentos">Marco legal</a>
            <a href="#privacidad">Privacidad</a>
          </nav>

          <button
            type="button"
            className="ghost-button save-button"
            onClick={saveDraft}
            aria-label={`${saveLabel} en este dispositivo`}
          >
            <span aria-hidden="true">{status === "saved" ? "✓" : "↓"}</span>{" "}
            {saveLabel}
          </button>
          <span className="sr-only" aria-live="polite">{saveLabel}</span>
        </header>

        {/* ── Trust strip ──────────────────────────────────── */}
        <section className="trust-strip" id="inicio" aria-label="Parámetros oficiales vigentes">
          <div>
            <span className="status-dot" aria-hidden="true" />{" "}
            Parámetros laborales México 2026
          </div>
          <span>UMA {money.format(UMA_2026)}/día</span>
          <span>
            Salario mínimo {money.format(MINIMUM_WAGE_GENERAL_2026)} general ·{" "}
            {money.format(MINIMUM_WAGE_NORTH_BORDER_2026)} frontera
          </span>
          <span className="privacy-chip">Tus datos no salen de este dispositivo</span>
        </section>

        {/* ── Workspace ────────────────────────────────────── */}
        <section className="workspace" id="calculadora" aria-label="Calculadora de finiquito">
          <div className="calculator-column">
            <div className="page-heading">
              <div>
                <p className="eyebrow">Herramienta para RR. HH., nómina y asesores</p>
                <h1>
                  Cálculo laboral profesional para decisiones de salida.
                </h1>
                <p>
                  Estima finiquitos y liquidaciones con desglose auditable,
                  supuestos visibles y recibo listo para revisión interna.
                </p>
                <div className="hero-insights" aria-label="Capacidades principales">
                  <span><strong>6</strong> escenarios laborales</span>
                  <span><strong>100%</strong> cálculo local</span>
                  <span><strong>A4</strong> recibo membretado</span>
                  <span><strong>CSV</strong> exportable y seguro</span>
                </div>
              </div>
              <span className="year-pill">MX · 2026</span>
            </div>

            {/* Stepper */}
            <div className="stepper" role="tablist" aria-label="Pasos del cálculo">
              {STEPS.map((step) => (
                <button
                  key={step.number}
                  id={`step-tab-${step.number}`}
                  data-step={step.number}
                  type="button"
                  className={activeStep === step.number ? "step active" : "step"}
                  role="tab"
                  aria-selected={activeStep === step.number}
                  aria-controls={`step-panel-${step.number}`}
                  tabIndex={activeStep === step.number ? 0 : -1}
                  onClick={() => setActiveStep(step.number)}
                  onKeyDown={handleStepKeyDown}
                >
                  <span aria-hidden="true">{step.number}</span>
                  {step.label}
                </button>
              ))}
            </div>

            {/* Form card */}
            <div className="form-card">
              <ErrorBoundary>
                {activeStep === 1 && (
                  <FormSeparacion
                    id="step-panel-1"
                    form={form}
                    result={result}
                    update={update}
                  />
                )}
                {activeStep === 2 && (
                  <FormPrestaciones
                    id="step-panel-2"
                    form={form}
                    result={result}
                    update={update}
                  />
                )}
                {activeStep === 3 && (
                  <FormDeducciones
                    id="step-panel-3"
                    form={form}
                    update={update}
                  />
                )}
              </ErrorBoundary>

              <div className="form-actions">
                <button type="button" className="text-button" onClick={resetForm}>
                  Restablecer datos
                </button>
                <div>
                  {activeStep > 1 && (
                    <button type="button" className="ghost-button" onClick={handlePrev}>
                      Anterior
                    </button>
                  )}
                  {activeStep < STEPS.length && (
                    <button type="button" className="primary-button" onClick={handleNext}>
                      Continuar <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Result panel */}
          <aside
            className="result-column"
            aria-live="polite"
            aria-label="Resultado del cálculo"
          >
            <ErrorBoundary>
              <ResultCard
                form={form}
                result={result}
                detailOpen={detailOpen}
                onToggleDetail={handleToggleDetail}
              />
            </ErrorBoundary>

            <div className="confidence-card">
              <span className="shield" aria-hidden="true">✓</span>
              <div>
                <strong>Control interno y trazabilidad</strong>
                <p>
                  Bases, días, factores e importes quedan visibles para revisión
                  de nómina, legal o auditoría.
                </p>
              </div>
            </div>

            <div className="assurance-stack" aria-label="Buenas prácticas incluidas">
              <span>Validación de fechas</span>
              <span>Deducciones capturadas con criterio fiscal</span>
              <span>Datos guardados solo en el navegador</span>
            </div>
          </aside>
        </section>

        {/* ── Fundamentos legales ──────────────────────────── */}
        <section
          className="legal-section"
          id="fundamentos"
          aria-label="Fundamentos normativos"
        >
          <div className="legal-heading">
            <p className="eyebrow">Fuentes y límites</p>
            <h2>Fundamentos claros para revisar cada supuesto.</h2>
            <p>
              La herramienta separa las prestaciones devengadas de las
              indemnizaciones condicionadas y permite revisar cada supuesto antes de
              emitir un recibo.
            </p>
          </div>
          <div className="legal-grid">
            <a
              href="https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf"
              target="_blank"
              rel="noreferrer"
              aria-label="Consultar Ley Federal del Trabajo (abre en pestaña nueva)"
            >
              <span>01</span>
              <strong>Ley Federal del Trabajo</strong>
              <p>
                Vacaciones, prima vacacional, aguinaldo, indemnización y prima de
                antigüedad.
              </p>
              <b>Consultar fuente oficial ↗</b>
            </a>
            <a
              href="https://www.inegi.org.mx/temas/uma/"
              target="_blank"
              rel="noreferrer"
              aria-label="Consultar UMA 2026 en INEGI (abre en pestaña nueva)"
            >
              <span>02</span>
              <strong>UMA 2026 · INEGI</strong>
              <p>
                Valor diario oficial de $117.31, vigente desde el 1 de febrero de 2026.
              </p>
              <b>Consultar fuente oficial ↗</b>
            </a>
            <a
              href="https://www.gob.mx/conasami/articulos/incremento-a-los-salarios-minimos-para-2026"
              target="_blank"
              rel="noreferrer"
              aria-label="Consultar salarios mínimos en CONASAMI (abre en pestaña nueva)"
            >
              <span>03</span>
              <strong>Salarios mínimos · CONASAMI</strong>
              <p>
                Salario mínimo general de $315.04 diarios desde el 1 de enero de
                2026.
              </p>
              <b>Consultar fuente oficial ↗</b>
            </a>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer id="privacidad">
          <div className="brand footer-brand">
            <span className="brand-mark" aria-hidden="true">FP</span>
            <span>
              <strong>Finiquito</strong>
              <b>Pro MX</b>
            </span>
          </div>
          <p>
            Privacidad por diseño: el cálculo y el borrador se procesan solo en
            este navegador. El recibo A4 queda listo para imprimir o guardar como PDF.
          </p>
          <span>Herramienta corporativa de cálculo laboral · México 2026</span>
        </footer>

        {/* ── Recibo para impresión ─────────────────────────── */}
        <PrintReceipt form={form} result={result} />
      </main>
    </>
  );
}
