# BUSINESS_LOGIC.md - VitalDent

## 1. Problema de Negocio

**Dolor:** Las clínicas dentales pierden hasta un 30% de los ingresos potenciales de tratamientos a largo plazo por seguimiento ineficiente. Las recepcionistas invierten horas diarias combinando expedientes físicos y Excel, imposibilitando un rastreo de pacientes que abandonaron su tratamiento.
**Costo actual:** Se pierden entre $45,000 y $150,000 MXN mensuales en valor de vida del paciente (al perder ~3 pacientes de tratamientos de alto valor). Las inasistencias por falta de recordatorios generan "horas de sillón vacío", costando a la clínica entre $500 y $1,200 MXN por hora.

## 2. Solución

**Propuesta de valor:** Un sistema modular de gestión clínica con IA que automatiza la consulta de expedientes, asiste a los pacientes post-consulta y visualiza el progreso exacto de los tratamientos para clínicas dentales en México.

**Flujo principal (Happy Path):**

1. Recepcionista agenda una cita, disparando recordatorios automatizados por WhatsApp 24h antes que actualizan el estatus al ser confirmados por el paciente.
2. Dentista usa el Copiloto AI (RAG) para consultar el contexto médico previo rápidamente.
3. Durante la consulta, el dentista actualiza el Odontograma interactivo y sube fotos del progreso del tratamiento.
4. El paciente recibe una alerta de su progreso en el "Tracker de Sonrisa" con el "Antes y Después", mientras la recepcionista procesa el cobro y timbra la factura CFDI 4.0 automáticamente.

## 3. Usuario Objetivo

**Rol:**

- Usuario Principal 1: La Recepcionista (Guardián del negocio y agenda).
- Usuario Principal 2: El Dentista / Especialista Clínico.
- Usuario Secundario: El Paciente (consumidor del portal y chatbot).
  **Contexto:** Clínicas de alto volumen en México que lidian con tiempos muertos en el consultorio, normativas estrictas (NOM-013, SAT CFDI 4.0) y pérdida de ingresos por falta de procesos automatizados de fidelización en tratamientos de $15K-$50K MXN.

## 4. Arquitectura de Datos

**Input:**

- Formulario de Anamnesis (cumplimiento NOM-013), información de identificación y fiscal del paciente.
- Coordenadas de Odontograma interactivo y notas médicas libres.
- Fotos intraorales/radiografías (JPEG/PNG/DICOM).
- Configuración fiscal y White-Label (logos, colores) de la clínica.
- Inventarios clínicos (SKUs, fechas de caducidad).
- Prompts para IA (del dentista y del paciente en el chatbot).

**Output:**

- Mensajes transaccionales (WhatsApp/Email para recordatorios y seguimientos).
- Documentos Legales: Facturas Electrónicas (CFDI 4.0 PDF y XML), Recetas médicas PDF y Consentimientos.
- GenAI: Resúmenes de expedientes para el doctor y asesoría segura post-consulta para el paciente.
- Portal del Paciente: Sliders de Antes/Después y barras de progreso del tratamiento.
- Dashboards y Reportes de Negocio: Gráficas de retención, ingresos y control de inventarios.

**Storage (Supabase tables sugeridas):**

- `clinics`: Datos del negocio, config White-Label, llaves fiscales (PAC).
- `profiles`: Recepcionistas y doctores (Auth extension con roles).
- `patients`: Demográficos, anamnesis, datos fiscales.
- `appointments`: Resevas, status del WhatsApp, ids de doctores y pacientes.
- `clinical_records`: Odontograma JSON, notas, diagnósticos.
- `treatment_journeys`: Progreso porcentual, enlaces a imágenes del Storage (Antes/Después).
- `invoices`: Registro de pagos y URLs a XMLs/PDFs emitidos.
- `inventory`: Artículos de la clínica, stock y alertas.

## 5. KPI de Éxito

**Métrica principal:** Reducir la tasa de ausentismo a menos del 5% en los primeros 30 días de uso. Como métrica interna de adopción del SaaS, lograr un 80% de DAU (Usuarios Activos Diarios) sostenido en el equipo de recepción.

## 6. Especificación Técnica (Para el Agente)

### Features a Implementar (Feature-First)

```
src/features/
├── auth/                 # Autenticación Email/Password con roles (Supabase)
├── dashboard/            # KPIs, ingresos, inasistencias y retención
├── agenda/               # Calendario interactivo + Notificaciones WhatsApp
├── clinical/             # Odontograma, Expediente NOM-013 y Recetas PDF
├── billing/              # Facturación CFDI 4.0, cobros y PAC api
├── ai-copilot/           # RAG Assistant para dentista en consultas
├── patient-portal/       # Tracker de Sonrisa (sliders), chatbot seguro
└── inventory/            # Gestión de stock clínico e insumos
```

### Stack Confirmado

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4 + shadcn/ui
- **Backend:** Supabase (Auth + Database + Storage)
- **AI Engine:** Vercel AI SDK v5 (RAG embeddings sobre clinical_records)
- **Validación:** Zod
- **State:** Zustand (si necesario)
- **MCPs:** Next.js DevTools + Playwright + Supabase

### Próximos Pasos

1. [ ] Setup proyecto base (Layouts, Routing)
2. [ ] Configurar base de datos Supabase y Auth (Roles: Doctor, Recepción)
3. [ ] Feature: Módulo Agenda y listado básico de Pacientes
4. [ ] Feature: Clínico (Formulario NOM-013 y diseño inicial de Odontograma)
5. [ ] Feature: Facturación y Cobros
6. [ ] Feature AI: Portal de paciente e Integración de Copiloto (RAG)
7. [ ] Testing E2E con Playwright
8. [ ] Deploy Vercel
