# Finiquito Pro MX

Calculadora web responsiva para estimar finiquitos y liquidaciones laborales en México con parámetros 2026, fórmulas visibles y fundamentos legales consultables.

## Funciones principales

- Seis escenarios de terminación laboral.
- Cálculo de sueldo pendiente, aguinaldo y vacaciones proporcionales.
- Prima vacacional y prima de antigüedad.
- Tope de prima de antigüedad según zona general o frontera norte.
- Indemnización constitucional y opción condicionada de 20 días por año.
- Desglose auditable de bases, días, factores e importes.
- Captura responsable de ISR, IMSS, Infonavit y otras deducciones.
- Borrador almacenado únicamente en el navegador (localStorage).
- Validación y migración segura de borradores guardados.
- Recibo listo para impresión y exportación compatible con Excel/CSV.
- Exportación protegida contra fórmulas inyectadas en hojas de cálculo.
- Diseño adaptable a computadora, tableta y teléfono.

## Tecnologías

- React 19
- Next.js 16
- TypeScript (strict)
- Tailwind CSS 4
- Vinext + Vite + Cloudflare Workers

## Requisitos

- Node.js ≥ 22.13.0
- npm

## Ejecutar localmente

```bash
npm ci
npm run dev
```

Abre la dirección local mostrada por Vite en la terminal.

Para publicar los metadatos sociales con tu propio dominio, configura
`NEXT_PUBLIC_SITE_URL` con la URL final del proyecto.

## Scripts

| Comando              | Descripción                                          |
|----------------------|------------------------------------------------------|
| `npm run dev`        | Servidor de desarrollo con HMR                       |
| `npm run build`      | Compilar para producción                             |
| `npm run start`      | Iniciar el build de producción                       |
| `npm run test`       | Tests unitarios + test de render (requiere build)    |
| `npm run test:calc`  | Solo tests unitarios del motor de cálculo (rápido)   |
| `npm run lint`       | Revisar código con ESLint                            |
| `npm run lint:fix`   | Revisar y corregir automáticamente                   |
| `npm run typecheck`  | Verificar tipos TypeScript sin compilar              |

## Estructura del proyecto

```text
app/
  components/
    ErrorBoundary.tsx     React Error Boundary
    FormDeducciones.tsx   Paso 3 — Deducciones
    FormPrestaciones.tsx  Paso 2 — Prestaciones
    FormSeparacion.tsx    Paso 1 — Datos de separación
    NumberField.tsx       Campo numérico reutilizable
    PrintReceipt.tsx      Recibo de impresión
    ResultCard.tsx        Panel de resultado con export
  hooks/
    useDraft.ts           Persistencia en localStorage (SSR-safe)
  lib/
    calculations.ts       Motor de cálculo (funciones puras)
    constants.ts          UMA, salario mínimo, form inicial
    draft.ts              Validación y versión del borrador local
    export.ts             Generador de CSV
    formatters.ts         Formateadores de moneda y decimales
  types/
    finiquito.ts          Tipos TypeScript compartidos
  globals.css             Estilos globales y diseño responsivo
  layout.tsx              Metadatos del sitio + Viewport
  page.tsx                Página principal (orquestación)
public/
  og.png                  Imagen para compartir en redes
tests/
  calculations.test.ts    Tests unitarios del motor de cálculo
  data-safety.test.ts     Tests de borradores y exportación segura
  rendered-html.test.mjs  Test de renderizado del worker
```

## Fuentes normativas

- [Ley Federal del Trabajo](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf)
- [UMA publicada por INEGI](https://www.inegi.org.mx/temas/uma/)
- [Salarios mínimos publicados por CONASAMI](https://www.gob.mx/conasami/documentos/tabla-de-salarios-minimos-generales-y-profesionales-por-areas-geograficas)

## Advertencia

El resultado es una estimación informativa. ISR, IMSS e Infonavit dependen de bases,
exenciones, periodicidad, acumulados y datos individuales que deben ser validados por
nómina o por un profesional. La aplicación no sustituye una resolución laboral o fiscal.

## Privacidad

El cálculo se realiza en el navegador. El borrador usa `localStorage` y nunca se envía
a un servidor.
