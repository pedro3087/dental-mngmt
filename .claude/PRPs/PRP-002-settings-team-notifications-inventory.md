# PRP-002: Settings — Equipo, Notificaciones e Inventario

> **Estado**: PENDIENTE
> **Fecha**: 2026-03-22
> **Proyecto**: dental-mngmt

---

## Objetivo

Implementar tres nuevas secciones en el área de Configuración: gestión del equipo/usuarios de la clínica, configuración de notificaciones (WhatsApp/Email + chatbot), y ajustes globales de inventario/alertas de stock; añadiendo tres tabs nuevos a la UI existente y sus correspondientes tablas en Supabase.

## Por Qué

| Problema | Solución |
|----------|----------|
| No hay forma de gestionar qué usuarios pertenecen a la clínica ni sus roles | Panel de Equipo con lista, cambio de rol inline, invitación y soft-delete |
| Los recordatorios de citas están hardcodeados o ausentes | Configuración de recordatorios WhatsApp/Email con plantillas editables |
| El saludo del chatbot está hardcodeado en el código fuente | Campo `chatbot_greeting` configurable desde BD sin tocar código |
| Las alertas de inventario no tienen umbrales globales ni categorías predefinidas | Tabla `inventory_settings` con defaults, categorías y unidades para autocomplete |

**Valor de negocio**: Permite al administrador de la clínica autogestionar su equipo sin intervención técnica, personalizar comunicaciones con pacientes y mantener control de inventario, todo desde una sola interfaz.

## Qué

### Criterios de Éxito
- [ ] Tab "Equipo" lista todos los usuarios de `profiles` con email, rol y fecha de ingreso; permite cambiar rol inline y desactivar (soft-delete)
- [ ] Tab "Equipo" tiene formulario funcional de invitación por email + rol que llama a Supabase Admin API (`inviteUserByEmail`)
- [ ] Tab "Notificaciones" guarda toggles de WhatsApp/Email, horas de anticipación y plantilla de mensaje en `notification_settings`
- [ ] Tab "Notificaciones" tiene campo editable para el saludo del chatbot; la ruta `/api/patient-chat/route.ts` lo lee desde BD
- [ ] Tab "Inventario" guarda umbral mínimo global, toggle de alertas, categorías (tag-input), unidades y email de alertas en `inventory_settings`
- [ ] Las categorías de `inventory_settings` se usan como autocomplete en el formulario de items de inventario
- [ ] `npm run typecheck` y `npm run build` pasan sin errores
- [ ] RLS habilitado en las dos nuevas tablas con aislamiento por `clinic_id`

### Comportamiento Esperado

**Equipo (tab=equipo)**:
El admin entra al tab y ve una tabla con todos los miembros de la clínica: avatar/inicial, email, rol actual (badge de color), fecha de ingreso. Puede cambiar el rol con un select inline (doctor/receptionist/admin) que guarda automáticamente. Puede desactivar un usuario (aparece en gris con badge "Inactivo") o reactivarlo. Un botón "Invitar usuario" abre un mini-form con campo email + select rol; al enviar, llama a server action que usa Supabase Admin SDK para enviar la invitación por email.

**Notificaciones (tab=notificaciones)**:
El admin ve dos secciones: Recordatorios (WhatsApp y Email, cada uno con toggle + select de horas 24h/48h/72h) y Plantillas (textarea con la plantilla del recordatorio con ayuda de variables `{nombre}`, `{fecha}`, `{hora}`). Debajo hay un campo de texto para el mensaje de bienvenida del chatbot. Al guardar, los valores se persisten en `notification_settings`. El endpoint `/api/patient-chat/route.ts` carga el greeting desde BD al inicio de cada conversación.

**Inventario/Alertas (tab=inventario)**:
El admin configura: toggle de alertas de stock crítico, umbral mínimo global (número), email para alertas, lista de categorías (tag-input: PPE, Resinas, Anestesia, Ortodoncia como defaults), lista de unidades de medida (misma mecánica). Los cambios se persisten en `inventory_settings`. Las categorías y unidades aparecen como opciones de autocomplete en el formulario de creación de items de inventario.

---

## Contexto

### Referencias
- `src/features/settings/components/BookingSettingsPanel.tsx` — Patrón de panel con secciones, toggles y formularios inline
- `src/features/settings/components/SettingsTabs.tsx` — Array `TABS` a extender con 3 nuevos items
- `src/app/(main)/settings/page.tsx` — Server component que carga datos y renderiza tabs condicionales
- `src/actions/settings.ts` — Patrón de server actions con `getClinicId()` helper
- `supabase/migrations/20260321000008_rls_policies.sql` — Patrón RLS con `public.get_user_clinic_id()`
- `supabase/migrations/20260321000002_extend_profiles_with_roles.sql` — Estructura actual de `profiles`
- `supabase/migrations/20260321000006_create_inventory.sql` — Estructura actual de `inventory`
- `src/app/api/patient-chat/route.ts` — Saludo hardcodeado a reemplazar con lectura desde BD

### Arquitectura Propuesta (Feature-First)

Los nuevos panels van dentro del directorio existente de settings. Se añaden server actions en el archivo existente `src/actions/settings.ts`.

```
src/features/settings/components/
├── BookingSettingsPanel.tsx      (existente)
├── ClinicProfilePanel.tsx        (existente)
├── BillingSettingsPanel.tsx      (existente)
├── SettingsTabs.tsx              (MODIFICAR — agregar 3 tabs)
├── TeamSettingsPanel.tsx         (NUEVO)
├── NotificationSettingsPanel.tsx (NUEVO)
└── InventorySettingsPanel.tsx    (NUEVO)

src/actions/settings.ts           (MODIFICAR — agregar acciones para las 3 secciones)

src/app/(main)/settings/page.tsx  (MODIFICAR — agregar 3 bloques condicionales)

src/app/api/patient-chat/route.ts (MODIFICAR — leer greeting desde BD)

supabase/migrations/
├── 20260322000003_profiles_active_column.sql     (NUEVO)
├── 20260322000004_notification_settings.sql      (NUEVO)
└── 20260322000005_inventory_settings.sql         (NUEVO)
```

### Modelo de Datos

**Migración 1 — columna `profiles.active`:**
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
```

**Migración 2 — tabla `notification_settings`:**
```sql
CREATE TABLE IF NOT EXISTS public.notification_settings (
  clinic_id           UUID    PRIMARY KEY REFERENCES public.clinics(id) ON DELETE CASCADE,
  wa_enabled          BOOLEAN NOT NULL DEFAULT false,
  email_enabled       BOOLEAN NOT NULL DEFAULT false,
  reminder_hours_1    INT     NOT NULL DEFAULT 24,   -- primera anticipación
  reminder_hours_2    INT     NOT NULL DEFAULT 48,   -- segunda anticipación (0 = desactivada)
  reminder_template   TEXT    DEFAULT '{nombre}, te recordamos tu cita el {fecha} a las {hora}.',
  chatbot_greeting    TEXT    DEFAULT 'Hola, soy el asistente virtual de la clínica. ¿En qué te puedo ayudar hoy?',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_settings_clinic_isolation" ON public.notification_settings
  FOR ALL USING (clinic_id = public.get_user_clinic_id())
  WITH CHECK (clinic_id = public.get_user_clinic_id());
```

**Migración 3 — tabla `inventory_settings`:**
```sql
CREATE TABLE IF NOT EXISTS public.inventory_settings (
  clinic_id            UUID     PRIMARY KEY REFERENCES public.clinics(id) ON DELETE CASCADE,
  default_min_quantity INT      NOT NULL DEFAULT 3,
  alerts_enabled       BOOLEAN  NOT NULL DEFAULT true,
  categories           TEXT[]   NOT NULL DEFAULT ARRAY['PPE','Resinas','Anestesia','Ortodoncia'],
  units                TEXT[]   NOT NULL DEFAULT ARRAY['pieza','caja','frasco','cartucho','kit'],
  alert_email          TEXT,
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inventory_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_settings_clinic_isolation" ON public.inventory_settings
  FOR ALL USING (clinic_id = public.get_user_clinic_id())
  WITH CHECK (clinic_id = public.get_user_clinic_id());
```

**Server Actions a agregar en `src/actions/settings.ts`:**

- `getTeamMembers()` → SELECT profiles WHERE clinic_id
- `updateMemberRole(userId, role)` → UPDATE profiles SET role
- `deactivateMember(userId)` → UPDATE profiles SET active = false
- `inviteTeamMember(email, role)` → Supabase Admin `inviteUserByEmail` + set role metadata
- `getNotificationSettings()` → SELECT notification_settings WHERE clinic_id
- `upsertNotificationSettings(data)` → UPSERT notification_settings
- `getInventorySettings()` → SELECT inventory_settings WHERE clinic_id
- `upsertInventorySettings(data)` → UPSERT inventory_settings

**Nota sobre `inviteUserByEmail`:** Requiere Supabase `service_role` key, no el cliente anónimo. Usar `createClient` con `SUPABASE_SERVICE_ROLE_KEY` solo en esta server action, nunca en cliente.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Migraciones de Base de Datos
**Objetivo**: Las tres nuevas estructuras de BD existen en Supabase — columna `profiles.active`, tabla `notification_settings`, tabla `inventory_settings` — con RLS correctamente configurado.
**Validación**: `mcp__supabase__list_tables` muestra las nuevas tablas; consulta SELECT devuelve defaults correctos.

### Fase 2: Server Actions
**Objetivo**: Todas las server actions para las 3 secciones están implementadas en `src/actions/settings.ts` con tipos TypeScript, validación y manejo de errores.
**Validación**: `npm run typecheck` pasa; las funciones exportadas tienen los tipos correctos.

### Fase 3: Panel de Equipo (UI)
**Objetivo**: `TeamSettingsPanel.tsx` implementado y conectado — lista de miembros, cambio de rol inline, soft-delete/reactivar, y formulario de invitación.
**Validación**: El tab "Equipo" muestra la tabla de usuarios y el formulario de invitación funciona visualmente.

### Fase 4: Panel de Notificaciones (UI)
**Objetivo**: `NotificationSettingsPanel.tsx` implementado — toggles de WA/Email, selects de horas, textarea de plantilla, campo de greeting del chatbot. El endpoint `/api/patient-chat/route.ts` lee el greeting desde BD.
**Validación**: Guardar en el panel persiste en BD; el chat usa el greeting personalizado.

### Fase 5: Panel de Inventario/Alertas (UI)
**Objetivo**: `InventorySettingsPanel.tsx` implementado — toggle de alertas, umbral global, tag-input de categorías y unidades, campo de email. Las categorías se propagan como autocomplete al formulario de inventario (si ya existe).
**Validación**: Guardar persiste en BD; el tag-input de categorías funciona (agregar/eliminar tags).

### Fase 6: Integración en Settings Page + Tabs
**Objetivo**: Los tres nuevos tabs aparecen en `SettingsTabs.tsx`, la `settings/page.tsx` carga los datos necesarios para cada tab y renderiza los nuevos panels condicionalmente.
**Validación**: Navegar a `?tab=equipo`, `?tab=notificaciones`, `?tab=inventario` muestra cada panel correctamente.

### Fase 7: Validación Final
**Objetivo**: Sistema funcionando end-to-end en todos los tabs nuevos.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot confirma los 3 nuevos tabs en Settings
- [ ] CRUD de equipo funciona (lista, cambio rol, desactivar, invitar)
- [ ] Guardar notificaciones persiste en BD
- [ ] Guardar configuración de inventario persiste en BD
- [ ] Chat carga greeting personalizado desde BD

---

## Aprendizajes (Self-Annealing / Neural Network)

> Esta sección CRECE con cada error encontrado durante la implementación.
> El conocimiento persiste para futuros PRPs. El mismo error NUNCA ocurre dos veces.

_(vacío — se completa durante implementación)_

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] `inviteUserByEmail` requiere `service_role` key — NUNCA usar el cliente anónimo ni exponerlo al browser. Solo desde server action.
- [ ] La política RLS en `profiles` ya tiene `profiles_clinic_isolation` y `profiles_own_read`. La acción `deactivateMember` debe verificar que el admin no se desactive a sí mismo.
- [ ] El campo `profiles.active` es nuevo — el helper `getClinicId()` existente no lo tiene; no romper las queries existentes que no filtran por `active`.
- [ ] El chatbot greeting en `patient-chat/route.ts` es público (anon, no autenticado). La query desde esa ruta debe usar el client anónimo con una política RLS que permita SELECT público por `clinic_id`, o bien hacer la lookup via `clinic_slug` que viene del contexto del paciente.
- [ ] El tag-input de categorías/unidades es un componente custom — no hay uno en el proyecto. Implementar con estado local simple (array de strings + input + Enter/comma para agregar).
- [ ] La migración de `profiles.active` debe tener `DEFAULT true` para que los usuarios existentes no queden inactivos.
- [ ] El tab `inventario` en `SettingsTabs` usa id corto — consistente con los existentes (`reservas`, `clinica`, `facturacion`).

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan (seguir el patrón de `BookingSettingsPanel`)
- NO ignorar errores de TypeScript
- NO hardcodear `clinic_id` en migraciones (seed data sí puede, pero las políticas deben ser dinámicas)
- NO usar `any` — usar tipos explícitos para todas las server actions
- NO omitir validación de rol: solo `admin` puede invitar usuarios y cambiar roles

---

*PRP pendiente aprobación. No se ha modificado código.*
