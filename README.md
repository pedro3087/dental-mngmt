# VitalDent - App de Gestión Clínica

Plataforma de software integral para clínicas dentales, incluyendo gestión de citas, expediente clínico digital, odontograma interactivo, control de inventario y facturación CFDI 4.0.

## Tecnologías Principales

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 3.4
- **Base de Datos**: Supabase (Auth, DB y RLS)
- **Componentes UI**: Tailwind y Lucide React
- **Validación**: Zod

## Estructura de Directorios

```
src/
├── app/                      # Rutas App Router (Next.js)
│   ├── (auth)/               # Autenticación de dentista/admin
│   ├── (main)/               # Panel principal del sistema
│   └── portal/               # Portal interactivo para pacientes
├── features/                 # Módulos por Dominio
│   ├── agenda/               # Control de citas
│   ├── clinical/             # Expedientes, odontograma, y planes
│   ├── inventory/            # Sistema de stock
│   └── billing/              # Facturación y cobros
├── shared/                   # Código compartido y global
```

## Requisitos y Configuración Local

1. Asegúrate de tener Node.js instalado (v18 o superior).
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno para la base de datos de Supabase en un archivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_apiKey_aqui
   ```
4. Inicia el servidor de desarrollo en local:
   ```bash
   npm run dev
   ```

## Notas Adicionales

Asegúrate de aplicar todas las migraciones SQL necesarias en tu base de datos Supabase para habilitar las funcionalidades de expedientes clínicos y control de acceso (RLS).
