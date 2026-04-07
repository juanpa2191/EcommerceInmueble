# InmuebleVida

Plataforma SaaS multi-tenant de finca raíz colombiana. Conecta empresas inmobiliarias con compradores destacando **experiencias de vida** (senderismo, piscina, turismo) como diferenciador frente a portales tradicionales.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.2 (App Router + Turbopack) |
| Lenguaje | TypeScript 5 |
| Base de datos / Auth / Storage | Supabase (PostgreSQL + RLS + Storage) |
| Auth providers | Email/contraseña + Google OAuth |
| CSS | Tailwind CSS v4 con variables `@theme` |
| Componentes UI | shadcn/ui (Base UI) |
| Formularios | React Hook Form v7 + Zod v4 |
| Estado global | Zustand v5 + TanStack Query v5 |
| Carrusel | Embla Carousel v8 |
| Bottom Sheet | vaul v1 |
| Upload de archivos | react-dropzone v15 |
| Notificaciones | Sonner v2 |
| Iconos | lucide-react |

## Roles

- **Admin** — gestiona actividades, hero images, tipos de inmueble y empresas (aprobar / suspender)
- **Empresa** — publica y administra sus ofertas con wizard de 4 pasos; ve métricas de vistas y clicks
- **Público** — navega el landing, filtra por actividades / precio / m², contacta por WhatsApp

## Rutas

```
/                          Landing: hero, destacados, actividades
/buscar                    Búsqueda con filtros facetados
/inmueble/[matricula]      Detalle: galería, actividades, contacto WhatsApp

/login                     Inicio de sesión
/registro                  Registro de empresa (wizard 2 pasos)
/auth/callback             Callback Google OAuth

/empresa/dashboard         Panel empresa: métricas + ofertas
/empresa/inmuebles/nuevo   Crear oferta (wizard 4 pasos)
/empresa/inmuebles/[id]/editar  Editar oferta

/admin/dashboard           Panel admin: métricas + empresas pendientes
/admin/empresas            Gestión de empresas
/admin/actividades         CRUD actividades + imágenes para landing
/admin/hero                Gestión de imágenes hero
/admin/tipos               Tipos de inmueble
/admin/geografico          Departamentos y municipios
```

## Esquema de base de datos

11 tablas en Supabase con RLS completo:

```
empresas            → nit, nombre, estado (pendiente|aprobada|inactiva)
usuarios            → id (→ auth.users), empresa_id, rol (admin|empresa)
departamentos       → 33 departamentos seed
municipios          → 331 municipios seed
tipos_inmueble      → 7 tipos seed
actividades         → nombre, tipo (interna|entorno), imagen_url, mostrar_en_landing
hero_imagenes       → imagen_url, actividad_id, activo, orden (máx. 2 activas)
predios             → matricula (UNIQUE), metros_cuadrados, municipio_id, tipo_inmueble_id
ofertas             → predio_id, empresa_id, precio, descripcion, activo, vistas, clicks_whatsapp
oferta_fotos        → oferta_id, imagen_url, orden (máx. 5, orden 0 = portada)
oferta_actividades  → PK(oferta_id, actividad_id)
```

## Migraciones

| # | Archivo | Contenido |
|---|---|---|
| 001 | `001_schema.sql` | 11 tablas, triggers, índices, constraints |
| 002 | `002_rls.sql` | RLS en todas las tablas, 27+ políticas |
| 003 | `003_seed_colombia.sql` | 33 departamentos + 331 municipios |
| 004 | `004_seed_catalogo.sql` | 7 tipos de inmueble + 20 actividades |
| 005 | `005_rpc_counters.sql` | RPCs `increment_vistas` / `increment_whatsapp` |
| 006 | `006_seed_test_data.sql` | 3 empresas + 12 predios + 13 ofertas de prueba |
| 007 | `007_security_fixes.sql` | Hardening: search_path, auto-aprobación bloqueada |

## Configuración local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/juanpa2191/EcommerceInmueble.git
cd EcommerceInmueble
npm install
```

### 2. Variables de entorno

Crea `.env.local` en la raíz (ver `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Supabase Storage

Crea los buckets públicos en tu proyecto de Supabase:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('hero',       'hero',       true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('fotos',      'fotos',      true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('actividades','actividades',true, 5242880, array['image/jpeg','image/png','image/webp']);
```

### 4. Usuario admin

Después de registrar tu usuario con Google OAuth, inserta la fila en `usuarios`:

```sql
insert into public.usuarios (id, rol)
values ('<auth.users uuid>', 'admin');
```

### 5. Servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Seguridad

- **Middleware** — verifica rol antes de acceder a `/admin/**` y `/empresa/**`
- **Server Actions** — `requireAdmin()` en todas las acciones de admin; `getEmpresaAprobada()` en empresa
- **RLS** — empresas no pueden cambiar su propio `estado`; insert requiere `auth.uid()`
- **Open redirect** — bloqueado en `/auth/callback` (solo rutas internas)
- **Storage** — políticas RLS por bucket; archivos eliminados al borrar registros
- **RPCs** — `set search_path = public` + filtro `activo = true`

## Historias de usuario

Ver [`HISTORIAS_USUARIO.md`](./HISTORIAS_USUARIO.md) — 73 historias organizadas por flujo (Público, Auth, Empresa, Admin, Seguridad).
