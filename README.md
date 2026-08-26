<div align="center">

# Finiquito Pro MX

### Calculadora laboral profesional para México

Estima finiquitos y liquidaciones con parámetros 2026, desglose auditable, privacidad por diseño y exportación segura.

![Versión](https://img.shields.io/badge/versión-0.2.0-0d1b36)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.13.0-339933?logo=nodedotjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Parámetros](https://img.shields.io/badge/parámetros-México%202026-006847)

</div>

![Vista previa de Finiquito Pro MX](public/og.png)

## Descripción

Finiquito Pro MX es una aplicación web responsiva orientada a recursos humanos, nómina, asesores y personas trabajadoras que necesitan una primera estimación de una separación laboral en México.

La herramienta distingue entre **finiquito**, **liquidación** y **deducciones**. Cada concepto muestra su base, días, factor, importe y referencia legal cuando corresponde. Todo el cálculo se ejecuta en el navegador: no requiere cuenta, base de datos ni envío de información personal a un servidor.

> [!IMPORTANT]
> El resultado es una estimación informativa. No sustituye la revisión de nómina, asesoría legal o fiscal, un convenio ratificado ni una resolución de la autoridad laboral.

## Funciones principales

- Seis escenarios de terminación laboral.
- Cálculo inmediato conforme se modifican los datos.
- Validación estricta de fechas y protección contra importes negativos o no finitos.
- Sueldo, aguinaldo y vacaciones proporcionales.
- Prima vacacional y prima de antigüedad.
- Salario diario integrado para conceptos indemnizatorios.
- Tope de prima de antigüedad según zona general o frontera norte.
- Indemnización constitucional y opción condicionada de 20 días por año.
- Comisiones, bonos, PTU y otras percepciones.
- Captura responsable de ISR, IMSS, Infonavit y otras deducciones.
- Desglose auditable con fórmulas y fundamentos legales visibles.
- Borrador local validado y versionado.
- Recibo optimizado para impresión.
- Exportación compatible con Excel mediante CSV protegido.
- Interfaz accesible y adaptable a computadora, tableta y teléfono.

## Escenarios contemplados

| Terminación laboral | Finiquito | Indemnización de 3 meses | Prima de antigüedad | 20 días por año |
|---|:---:|:---:|:---:|:---:|
| Renuncia voluntaria | Sí | No | Desde 15 años de servicio | No |
| Despido injustificado | Sí | Sí | Sí | Opcional y condicionado |
| Rescisión imputable al patrón | Sí | Sí | Sí | Opcional y condicionado |
| Despido justificado | Sí | No | Sí | No |
| Terminación de contrato | Sí | No | No automático | No |
| Mutuo acuerdo | Sí | No automático | No automático | No automático |

La procedencia definitiva depende de los hechos, documentos, convenio y criterio jurídico aplicable. La opción de 20 días por año no se activa automáticamente.

## Conceptos calculados

### Finiquito

- Sueldo pendiente.
- Aguinaldo proporcional, descontando días ya pagados.
- Vacaciones proporcionales del ciclo actual.
- Vacaciones pendientes de ciclos anteriores.
- Prima vacacional.
- Comisiones y bonos.
- PTU pendiente.
- Otras percepciones.

### Liquidación

- Indemnización constitucional de 90 días con salario diario integrado.
- Veinte días por año cuando el usuario confirma que el supuesto aplica.
- Prima de antigüedad de 12 días por año, con tope de dos salarios mínimos.

### Deducciones

- ISR retenido.
- Cuota obrera del IMSS.
- Amortización Infonavit.
- Otras deducciones autorizadas.

ISR, IMSS e Infonavit se capturan manualmente porque sus importes dependen de bases, exenciones, periodicidad, acumulados y datos individuales. La aplicación evita presentar una precisión fiscal que no puede sostener sin esa información.

## Parámetros 2026

| Parámetro | Valor diario | Vigencia usada |
|---|---:|---|
| UMA | $117.31 MXN | Desde el 1 de febrero de 2026 |
| Salario mínimo general | $315.04 MXN | Desde el 1 de enero de 2026 |
| Salario mínimo de la Zona Libre de la Frontera Norte | $440.87 MXN | Desde el 1 de enero de 2026 |

Los valores están centralizados en <code>app/lib/constants.ts</code> para facilitar su actualización anual.

## Privacidad y seguridad

- El cálculo ocurre completamente en el cliente.
- El borrador permanece en <code>localStorage</code> y nunca se envía al servidor.
- Los datos restaurados se validan, limitan y normalizan antes de usarse.
- La exportación neutraliza valores que podrían convertirse en fórmulas de hoja de cálculo.
- Las fechas se validan sin normalizaciones silenciosas de JavaScript.
- El neto nunca se presenta como una cantidad negativa.
- Se aplican CSP, protección contra framing, <code>nosniff</code>, política de referente y restricciones de permisos.
- No se solicitan cámara, micrófono, geolocalización, pagos ni dispositivos USB.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Interfaz | React 19 + Next.js 16 App Router |
| Lenguaje | TypeScript 5.9 en modo estricto |
| Estilos | Tailwind CSS 4 + CSS responsivo |
| Desarrollo | Vite 8 |
| Compilación | Vinext |
| Ejecución | Cloudflare Worker |
| Pruebas | Node Test Runner + TSX |
| Calidad | ESLint 9 + TypeScript |

## Requisitos

- Node.js 22.13.0 o posterior.
- npm incluido con Node.js.

Comprueba las versiones instaladas:

~~~bash
node --version
npm --version
~~~

## Instalación y ejecución local

~~~bash
git clone https://github.com/Joseluiscruz-hub/Finiquito-Pro-MX-v2.git
cd Finiquito-Pro-MX-v2
npm ci
npm run dev
~~~

Abre la dirección local que Vite muestre en la terminal.

Para que las etiquetas Open Graph y Twitter utilicen el dominio final, configura la variable:

~~~bash
NEXT_PUBLIC_SITE_URL=https://tu-dominio.example
~~~

## Scripts disponibles

| Comando | Descripción |
|---|---|
| <code>npm run dev</code> | Inicia el entorno de desarrollo con recarga rápida |
| <code>npm run build</code> | Genera el build de producción con Vinext |
| <code>npm run start</code> | Ejecuta localmente el build de producción |
| <code>npm run test:calc</code> | Ejecuta las pruebas del motor, borradores y exportación |
| <code>npm run test</code> | Ejecuta pruebas, compila y valida el HTML servido por el worker |
| <code>npm run lint</code> | Analiza el código con ESLint |
| <code>npm run lint:fix</code> | Aplica correcciones automáticas de ESLint |
| <code>npm run typecheck</code> | Comprueba los tipos sin generar archivos |

## Verificación antes de publicar

~~~bash
npm ci
npm run lint
npm run typecheck
npm run test
~~~

La suite cubre, entre otros casos:

- Fechas inexistentes, invertidas y cruces de horario.
- Años completos de antigüedad.
- Tabla progresiva de vacaciones.
- Aguinaldo proporcional, incluido año bisiesto.
- Factor de integración salarial.
- Escenarios con y sin liquidación.
- Tope por zona de la prima de antigüedad.
- Valores negativos, infinitos y deducciones superiores al bruto.
- Saneamiento de borradores y exportación segura.
- Renderizado del worker de producción.

## Estructura del proyecto

~~~text
app/
├── components/              Formularios, resultado y recibo imprimible
├── hooks/useDraft.ts        Persistencia local compatible con SSR
├── lib/
│   ├── calculations.ts      Motor de cálculo mediante funciones puras
│   ├── constants.ts         UMA, salarios mínimos y estado inicial
│   ├── draft.ts             Validación y versión del borrador
│   ├── export.ts            Generación segura del CSV
│   └── formatters.ts        Formato de moneda y decimales
├── types/finiquito.ts       Contratos TypeScript compartidos
├── globals.css              Diseño visual, responsivo e impresión
├── layout.tsx               Metadatos, iconos y tarjetas sociales
└── page.tsx                 Orquestación de la experiencia
public/
├── favicon.svg
└── og.png
tests/
├── calculations.test.ts
├── data-safety.test.ts
└── rendered-html.test.mjs
worker/index.ts              Entrada de Cloudflare Worker
security-headers.ts          Cabeceras defensivas centralizadas
vite.config.ts               Vite, Vinext y configuración de build
~~~

## Arquitectura

El flujo principal mantiene separadas las responsabilidades:

1. Los formularios actualizan un estado tipado.
2. <code>calculate()</code> recibe ese estado y devuelve un resultado determinista.
3. La interfaz presenta totales y fórmulas sin duplicar reglas de negocio.
4. El recibo y el CSV reutilizan el mismo resultado calculado.
5. El worker sirve la aplicación y añade las cabeceras de seguridad.

Esta separación permite probar el motor sin renderizar la interfaz y reduce el riesgo de diferencias entre pantalla, impresión y exportación.

## Despliegue

El proyecto está preparado para un runtime compatible con Cloudflare Workers mediante Vinext y Vite. Antes de publicar:

1. Define <code>NEXT_PUBLIC_SITE_URL</code> con la URL definitiva.
2. Ejecuta la verificación completa.
3. Genera el artefacto con <code>npm run build</code>.
4. Publica el build conforme al flujo de la plataforma de destino.

No se requieren base de datos, almacenamiento de objetos ni secretos para las funciones actuales.

## Fuentes normativas

- [Ley Federal del Trabajo — Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf)
- [Unidad de Medida y Actualización — INEGI](https://www.inegi.org.mx/temas/uma/)
- [Salarios mínimos 2026 — CONASAMI](https://www.gob.mx/conasami/es/articulos/se-publican-en-el-diario-oficial-de-la-federacion-los-salarios-minimos-vigentes-a-partir-del-1-de-enero-de-2026)

Artículos de la LFT referenciados por el motor: 48, 50, 76, 79, 80, 87, 162, 485 y 486.

## Límites conocidos

- No determina automáticamente ISR, IMSS o Infonavit.
- No contempla todos los contratos colectivos, prestaciones superiores, salarios variables ni situaciones procesales.
- No sustituye evidencia documental ni revisión profesional.
- Los parámetros oficiales deben revisarse y actualizarse cada año.
- La aplicación está enfocada en relaciones laborales reguladas por la legislación mexicana y no debe extrapolarse a otros países.

## Autor

Desarrollado por [José Luis Cruz Prieto](https://github.com/Joseluiscruz-hub).

Si encuentras una inconsistencia en una fórmula o fundamento, abre un issue con el escenario, las fechas, los importes de entrada y el resultado esperado.
