# PRP-001: Supabase Schema Completo + RLS por Clínica + Auth Roles

> **Estado**: COMPLETADO — 2026-03-21
> **Fecha**: 2026-03-21
> **Proyecto**: dental-mngmt (VitalDent)

---

## Objetivo

Establecer el esquema de base de datos completo de VitalDent en Supabase (clinics, profiles con roles, patients, appointments, clinical_records, invoices, inventory) con Row Level Security real aislada por clínica, y conectar los roles Doctor/Recepcionista al middleware de Next.js y a los componentes de UI para controlar acceso y visibilidad por rol.

## Por Qué

| Problema | Solución |
|----------|----------|
| Las tablas existentes (patients, appointments, treatment_journeys) no tienen aislamiento por clínica — cualquier usuario autenticado puede leer todos los datos de todas las clínicas | Agregar `clinic_id` como columna FK a todas las tablas operacionales + RLS que filtra `clinic_id = auth.jwt() ->> 'clinic_id'` |
| El modelo `profiles` actual no tiene `role` ni `clinic_id` — no hay forma de saber si el usuario es Doctor o Recepcionista en middleware o componentes | Agregar `role ENUM('doctor', 'receptionist', 'admin')` y `clinic_id` a `profiles`; el JWT custom claim lo propaga al frontend |
| El middleware de Next.js (`proxy.ts`) tiene las rutas protegidas comentadas — no hay redirección ni control de acceso | Reactivar y extender el middleware para redirigir no-autenticados a `/login`, y bloquear rutas sensibles (expedientes clínicos, facturación) a roles sin permiso |
| No existen las tablas `clinics`, `clinical_records` ni `invoices` en el schema actual | Crear esas tablas con sus columnas según BUSINESS_LOGIC.md e integrarlas con las tablas existentes |
| Tablas `inventory`, `treatment_journeys` y `treatment_milestones` tienen RLS trivial (`USING (true)`) | Reemplazar políticas permisivas por políticas reales basadas en `clinic_id` del JWT |

**Valor de negocio**: Sin este PRP todo lo construido es una demo sin seguridad real. La multi-clínica y el RBAC son el núcleo del negocio SaaS — sin ellos no se puede vender VitalDent a más de una clínica ni garantizar confidencialidad de expedientes (requisito NOM-013).

## Qué

### Criterios de Éxito

- [ ] Un usuario Doctor de Clínica A **no puede** leer pacientes ni citas de Clínica B (validado con `execute_sql` en Supabase)
- [ ] Un usuario Recepcionista **no puede** acceder a `/clinical/[patientId]` — el middleware redirige a `/dashboard`
- [ ] El hook `useAuth` expone `profile.role` y `profile.clinic_id` correctamente en componentes cliente
- [ ] El `Sidebar` muestra/oculta ítems según el rol (Recepcionista no ve AI Copilot; Doctor no ve Facturación)
- [ ] `npm run typecheck` pasa con el tipo `Database` extendido
- [ ] `npm run build` exitoso sin errores
- [ ] Las políticas RLS se validan con `get_advisors` del MCP Supabase (cero warnings de RLS deshabilitado)

### Comportamiento Esperado

**Happy Path — Recepcionista en Agenda:**
1. Recepcionista inicia sesión → middleware detecta sesión válida → redirige a `/dashboard`
2. Sidebar muestra: Dashboard, Agenda, Facturación, Inventario (oculta Clínico y AI Copilot)
3. Recepcionista crea cita → `createAppointment` inserta con `clinic_id` del JWT → RLS solo permite ver citas de su clínica
4. Recepcionista intenta navegar a `/clinical/xyz` → middleware bloquea → redirect a `/dashboard`

**Happy Path — Doctor en Módulo Clínico:**
1. Doctor inicia sesión → middleware detecta rol `doctor` → acceso completo
2. Sidebar muestra todos los módulos incluyendo Clínico y AI Copilot
3. Doctor abre expediente de paciente → `clinical_records` devuelve solo registros de su clínica (RLS)
4. Doctor intenta leer datos de otra clínica → Supabase retorna 0 filas (RLS silencioso)

---

## Contexto

### Estado Actual del Codebase

**Tablas existentes (con migración):**
- `treatment_journeys` — tiene RLS habilitado pero política `USING (true)` (insegura)
- `treatment_milestones` — mismo problema
- `patients` — existe en código pero sin migración visible (solo en `database.ts`)
- `appointments` — existe en código pero sin migración visible
- `profiles` — existe sin `role` ni `clinic_id`

**Tablas faltantes:** `clinics`, `clinical_records`, `invoices`, `inventory`

**Auth:** Email/Password funcional (`src/actions/auth.ts`). Sin custom claims JWT. Sin roles.

**Middleware:** `src/lib/supabase/proxy.ts` — tiene lógica de redirección comentada.

**Tipos:** `src/types/database.ts` — desactualizado, le faltan las nuevas tablas y campos.

**useAuth:** `src/hooks/useAuth.ts` — devuelve `profile` sin `role` ni `clinic_id`.

### Referencias

- `src/types/database.ts` — Tipos actuales a extender
- `src/hooks/useAuth.ts` — Hook a extender con `role` y `clinic_id`
- `src/lib/supabase/proxy.ts` — Middleware a reactivar con RBAC
- `src/components/layout/Sidebar.tsx` — Navegación a filtrar por rol
- `src/actions/agenda.ts` — Patrón de Server Action a actualizar con `clinic_id`
- `src/actions/clinical.ts` — Patrón de Server Action existente
- `supabase/migrations/20260311000000_add_treatment_tracking.sql` — Migración existente como referencia de estilo

### Arquitectura Propuesta

**Estrategia de multiclínica:** `clinic_id` propagado via JWT custom claim.

Supabase permite definir un `auth.jwt()` que incluya campos custom. El flujo es:
1. Al hacer signup/login, un trigger de Postgres actualiza `profiles` con `clinic_id` y `role`
2. El JWT incluye `clinic_id` y `role` via una función RPC o un DB Hook
3. Las políticas RLS usan `(auth.jwt() ->> 'clinic_id')::uuid` — sin joins adicionales
4. El middleware Next.js lee `user_metadata` o llama a `getProfile()` para conocer el rol

**Alternativa más simple (recomendada para V1):** En lugar de JWT custom claims (que requieren configuración extra en Supabase), el middleware llama a `supabase.from('profiles').select('role, clinic_id')` en cada request protegido, cachea en cookie httpOnly, y las políticas RLS usan `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND clinic_id = [tabla].clinic_id)`.

**Estructura de archivos a crear/modificar:**

```
supabase/migrations/
├── 20260321000001_create_clinics.sql
├── 20260321000002_create_profiles_with_roles.sql
├── 20260321000003_create_patients_complete.sql
├── 20260321000004_create_appointments_complete.sql
├── 20260321000005_create_clinical_records.sql
├── 20260321000006_create_invoices.sql
├── 20260321000007_create_inventory.sql
└── 20260321000008_rls_policies_all_tables.sql

src/
├── types/database.ts              # Reescribir completo con todas las tablas
├── hooks/useAuth.ts               # Extender: exponer role y clinic_id
├── lib/supabase/proxy.ts          # Reactivar middleware + RBAC por rol
├── components/layout/Sidebar.tsx  # Filtrar rutas por rol
└── actions/
    ├── agenda.ts                  # Agregar clinic_id en inserts/selects
    └── clinical.ts                # Agregar clinic_id en inserts/selects
```

### Modelo de Datos Completo

```sql
-- === TABLA BASE ===
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,           -- para white-label (ej: "vitaldent-monterrey")
  phone TEXT,
  address TEXT,
  rfc TEXT,                            -- Para CFDI 4.0
  pac_credentials JSONB,               -- Llaves del PAC de facturación (cifradas)
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === PROFILES CON ROLES ===
-- La tabla profiles ya existe pero necesita clinic_id y role
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id),
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'receptionist'
    CHECK (role IN ('doctor', 'receptionist', 'admin'));

-- === PATIENTS COMPLETO ===
-- Si existe, agregar clinic_id. Si no, crear desde cero.
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id),
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('M', 'F', 'otro')),
  ADD COLUMN IF NOT EXISTS rfc TEXT,
  ADD COLUMN IF NOT EXISTS cfdi_use TEXT DEFAULT 'G03',
  ADD COLUMN IF NOT EXISTS anamnesis JSONB DEFAULT '{}';    -- NOM-013

-- === APPOINTMENTS COMPLETO ===
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id),
  ADD COLUMN IF NOT EXISTS service_type TEXT,
  ADD COLUMN IF NOT EXISTS amount_mxn NUMERIC(10,2);

-- === CLINICAL RECORDS ===
CREATE TABLE public.clinical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  appointment_id UUID REFERENCES public.appointments(id),
  odontogram JSONB DEFAULT '{}',        -- Estado de cada diente (1-32)
  diagnosis TEXT,
  treatment_plan TEXT,
  notes TEXT,
  image_urls TEXT[] DEFAULT '{}',       -- URLs de fotos/radiografías en Storage
  prescription JSONB DEFAULT '{}',      -- Receta médica estructurada
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === INVOICES ===
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  appointment_id UUID REFERENCES public.appointments(id),
  folio TEXT,                           -- Folio interno
  uuid_fiscal TEXT,                     -- UUID del CFDI emitido
  amount_subtotal NUMERIC(10,2) NOT NULL,
  amount_tax NUMERIC(10,2) DEFAULT 0,
  amount_total NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'PUE',    -- PUE o PPD
  payment_form TEXT DEFAULT '01',       -- Catálogo SAT
  cfdi_use TEXT DEFAULT 'G03',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'cancelled', 'paid')),
  xml_url TEXT,                         -- URL en Supabase Storage
  pdf_url TEXT,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === INVENTORY ===
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  unit TEXT DEFAULT 'pieza',
  quantity_current INT DEFAULT 0,
  quantity_min INT DEFAULT 5,           -- Umbral de alerta
  unit_cost NUMERIC(10,2),
  expiry_date DATE,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === RLS — PATRÓN ESTÁNDAR POR CLÍNICA ===
-- Función helper para obtener clinic_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Función helper para obtener el rol del usuario
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- RLS por tabla (patrón repetido):
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_milestones ENABLE ROW LEVEL SECURITY;

-- Ejemplo política patients (replicar para cada tabla con clinic_id):
CREATE POLICY "clinic_isolation_patients" ON public.patients
  FOR ALL USING (clinic_id = public.get_user_clinic_id());

-- clinical_records: solo doctores pueden ESCRIBIR
CREATE POLICY "clinic_isolation_clinical_records_read" ON public.clinical_records
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

CREATE POLICY "doctors_only_write_clinical_records" ON public.clinical_records
  FOR INSERT WITH CHECK (
    clinic_id = public.get_user_clinic_id()
    AND public.get_user_role() IN ('doctor', 'admin')
  );

CREATE POLICY "doctors_only_update_clinical_records" ON public.clinical_records
  FOR UPDATE USING (
    clinic_id = public.get_user_clinic_id()
    AND public.get_user_role() IN ('doctor', 'admin')
  );

-- invoices: recepcionista puede crear, doctor puede leer
CREATE POLICY "clinic_isolation_invoices" ON public.invoices
  FOR ALL USING (clinic_id = public.get_user_clinic_id());
```

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Migraciones SQL — Schema Completo
**Objetivo**: Crear todas las tablas faltantes (`clinics`, `clinical_records`, `invoices`, `inventory`) y agregar columnas a las existentes (`profiles.role`, `profiles.clinic_id`, `patients.clinic_id`, `appointments.clinic_id`). Registrar una clínica de desarrollo semilla para pruebas.
**Validación**: `mcp__supabase__list_tables` muestra las 8 tablas. `mcp__supabase__execute_sql` confirma que `profiles` tiene columnas `role` y `clinic_id`.

### Fase 2: Funciones Helper + RLS Policies
**Objetivo**: Crear las funciones `get_user_clinic_id()` y `get_user_role()` en Postgres. Eliminar las políticas `USING (true)` existentes en `treatment_journeys` y `treatment_milestones`. Aplicar políticas de aislamiento por `clinic_id` en todas las tablas. Aplicar política de escritura por rol en `clinical_records`.
**Validación**: `mcp__supabase__get_advisors` retorna 0 warnings de "RLS disabled". Test SQL: un usuario sin `clinic_id` no puede leer ninguna fila.

### Fase 3: Tipos TypeScript Actualizados
**Objetivo**: Reescribir `src/types/database.ts` con las interfaces completas de todas las tablas (incluyendo `clinic_id`, `role`, nuevas tablas). El tipo `Database` generado debe coincidir con el schema real de Supabase.
**Validación**: `npm run typecheck` pasa. Las interfaces existentes en `src/actions/*.ts` no tienen errores de tipo.

### Fase 4: Hook `useAuth` con Rol y Clínica
**Objetivo**: Extender `src/hooks/useAuth.ts` para exponer `profile.role` y `profile.clinic_id` en componentes cliente. Tipar correctamente el retorno del hook.
**Validación**: El hook compila sin errores. En componentes cliente, `useAuth().profile?.role` es accesible con autocompletion TypeScript.

### Fase 5: Middleware RBAC Activo
**Objetivo**: Reactivar el código comentado en `src/lib/supabase/proxy.ts` y extenderlo con lógica de roles. Rutas protegidas: todas las rutas `/(main)/*` requieren sesión. Rutas solo-doctor: `/clinical/*` y `/ai-copilot`. No se requiere rol para `/dashboard`, `/agenda`, `/billing`, `/inventory`.
**Validación**: Sin sesión → `/login`. Recepcionista accede a `/clinical/xyz` → redirect a `/dashboard`. Doctor accede a `/clinical/xyz` → paso normal.

### Fase 6: Sidebar Filtrado por Rol
**Objetivo**: Modificar `src/components/layout/Sidebar.tsx` para leer el rol del usuario (via Server Component o prop del layout) y mostrar/ocultar rutas según permisos. Recepcionista no ve "Clínico" ni "AI Copilot". Doctor ve todo. Admin ve todo.
**Validación**: Screenshot Playwright muestra Sidebar con ítems correctos por rol.

### Fase 7: Server Actions con `clinic_id`
**Objetivo**: Actualizar `src/actions/agenda.ts` y `src/actions/clinical.ts` para incluir `clinic_id` del perfil autenticado en todos los `INSERT` y `SELECT`. Esto es la segunda capa de defensa (la primera es RLS).
**Validación**: `createAppointment` inserta cita con `clinic_id` correcto. `getUpcomingAppointments` solo devuelve citas de la clínica del usuario.

### Fase 8: Validación Final E2E
**Objetivo**: Sistema funcionando end-to-end con autenticación, roles, RLS y UI condicional.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot de Sidebar como Doctor vs Recepcionista confirma diferencias
- [ ] Test manual: login Recepcionista → intento acceso `/clinical` → redirect verificado
- [ ] `mcp__supabase__get_advisors` — cero warnings de seguridad

---

## Aprendizajes (Self-Annealing)

> Esta sección CRECE con cada error encontrado durante la implementación.

### 2026-03-21: useSearchParams requiere Suspense en producción
- **Error**: Next.js build falla con `useSearchParams() should be wrapped in a suspense boundary at page "/login"`
- **Fix**: Envolver el componente que usa `useSearchParams` en `<Suspense fallback={...}>` dentro de la page
- **Aplicar en**: Cualquier page que renderice un componente Client con `useSearchParams`, `usePathname` dinámica, etc.

### 2026-03-21: tsc no instalado globalmente — usar node_modules/.bin/tsc
- **Error**: `npx tsc` instala el paquete `tsc@2.0.4` (incorrecto) en lugar de TypeScript
- **Fix**: Usar `node_modules/.bin/tsc --noEmit` o agregar `"typecheck": "tsc --noEmit"` al package.json
- **Aplicar en**: Todos los proyectos Next.js — agregar el script al package.json en setup inicial

### 2026-03-21: Cookie handlers en @supabase/ssr necesitan tipos explícitos con strict TS
- **Error**: `Parameter 'cookiesToSet' implicitly has an 'any' type` en proxy.ts y server.ts
- **Fix**: Tipar `cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]`
- **Aplicar en**: Cualquier proyecto que use `@supabase/ssr` con TypeScript strict mode

---

## Gotchas

- [ ] **JWT custom claims vs query-per-request**: Los JWT custom claims en Supabase requieren configurar un hook en el Dashboard de Supabase (Database → Hooks). Para evitar complejidad en V1, la Fase 2 usará `SECURITY DEFINER` functions que hacen una query a `profiles` — más simple pero un lookup por request. Documentar el trade-off.
- [ ] **Migraciones sobre tablas existentes**: `patients` y `appointments` ya existen en producción (datos reales en la cuenta Supabase). Usar `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` — nunca `DROP` ni `CREATE TABLE` sin `IF NOT EXISTS`.
- [ ] **`treatment_journeys` RLS actual es `USING (true)`**: Hay datos de desarrollo. La nueva política romperá las queries si los registros no tienen `clinic_id`. La migración debe hacer `UPDATE treatment_journeys SET clinic_id = [clinic_seed_id]` antes de aplicar RLS estricto. Mismo para `treatment_milestones`.
- [ ] **Sidebar es Client Component**: Para leer el rol en el Sidebar (Client Component) usar `useAuth()`. Para el layout (Server Component), leer el perfil con `createClient()` del servidor y pasarlo como prop. Evitar hacer dos fetches.
- [ ] **Middleware y `getUser()` lento**: El middleware actual ya llama a `supabase.auth.getUser()`. Agregar un segundo `.from('profiles')` en cada request puede añadir latencia. Evaluar guardar `role` en cookie httpOnly al hacer login.
- [ ] **`any` en `clinical.ts`**: Hay un `@ts-ignore` en `getJourneyByShareToken`. Este PRP debe eliminarlo al actualizar los tipos.

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear `clinic_id` en el código — siempre obtener del perfil autenticado
- NO omitir `clinic_id` en ningún INSERT a tablas operacionales
- NO usar `USING (true)` en ninguna política RLS
- NO exponer `pac_credentials` (llaves del PAC) en queries del lado cliente

---

*PRP pendiente aprobación. No se ha modificado código.*
