-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- =====================
-- EMPRESAS
-- =====================
create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nit varchar(20) unique not null,
  nombre varchar(255) not null,
  telefono varchar(15) not null,
  correo varchar(255) not null,
  encargado_nombre varchar(255) not null,
  encargado_telefono varchar(15) not null,
  estado varchar(20) not null default 'pendiente'
    check (estado in ('pendiente', 'aprobada', 'inactiva')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- USUARIOS (extiende auth.users de Supabase)
-- =====================
create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid references public.empresas(id) on delete set null,
  rol varchar(20) not null check (rol in ('admin', 'empresa')),
  created_at timestamptz not null default now()
);

-- =====================
-- GEOGRAFÍA
-- =====================
create table public.departamentos (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(100) not null,
  created_at timestamptz not null default now()
);

create table public.municipios (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(100) not null,
  departamento_id uuid not null references public.departamentos(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- =====================
-- CATÁLOGO
-- =====================
create table public.tipos_inmueble (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(100) not null,
  created_at timestamptz not null default now()
);

create table public.actividades (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(150) not null,
  imagen_url text,
  tipo varchar(20) not null check (tipo in ('interna', 'entorno')),
  activo boolean not null default true,
  mostrar_en_landing boolean not null default false,
  orden_landing integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- HERO IMÁGENES (Sección 1 landing — máx. 2 activas)
-- =====================
create table public.hero_imagenes (
  id uuid primary key default gen_random_uuid(),
  imagen_url text not null,
  actividad_id uuid references public.actividades(id) on delete set null,
  activo boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

-- =====================
-- PREDIOS (predio físico, identificado por matrícula)
-- =====================
create table public.predios (
  id uuid primary key default gen_random_uuid(),
  matricula varchar(50) unique not null,
  metros_cuadrados decimal(10,2) not null,
  municipio_id uuid not null references public.municipios(id),
  tipo_inmueble_id uuid not null references public.tipos_inmueble(id),
  destacado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- OFERTAS (lo que cada empresa publica sobre un predio)
-- =====================
create table public.ofertas (
  id uuid primary key default gen_random_uuid(),
  predio_id uuid not null references public.predios(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  precio decimal(15,2) not null,
  descripcion text,
  activo boolean not null default true,
  vistas integer not null default 0,
  clicks_whatsapp integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_empresa_predio unique (predio_id, empresa_id)
);

-- =====================
-- FOTOS DE OFERTAS (máx. 5, orden=0 es portada)
-- =====================
create table public.oferta_fotos (
  id uuid primary key default gen_random_uuid(),
  oferta_id uuid not null references public.ofertas(id) on delete cascade,
  imagen_url text not null,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

-- =====================
-- OFERTA ↔ ACTIVIDADES (muchos-a-muchos)
-- =====================
create table public.oferta_actividades (
  oferta_id uuid not null references public.ofertas(id) on delete cascade,
  actividad_id uuid not null references public.actividades(id) on delete cascade,
  primary key (oferta_id, actividad_id)
);

-- =====================
-- ÍNDICES para búsqueda y performance
-- =====================
create index idx_predios_municipio on public.predios(municipio_id);
create index idx_predios_tipo on public.predios(tipo_inmueble_id);
create index idx_predios_destacado on public.predios(destacado) where destacado = true;
create index idx_ofertas_predio on public.ofertas(predio_id);
create index idx_ofertas_empresa on public.ofertas(empresa_id);
create index idx_ofertas_activo on public.ofertas(activo) where activo = true;
create index idx_oferta_fotos_oferta on public.oferta_fotos(oferta_id);
create index idx_oferta_actividades_oferta on public.oferta_actividades(oferta_id);
create index idx_oferta_actividades_actividad on public.oferta_actividades(actividad_id);
create index idx_municipios_departamento on public.municipios(departamento_id);

-- Índice para búsqueda insensible a mayúsculas (ilike)
create index idx_municipios_nombre_lower on public.municipios using btree(lower(nombre));
create index idx_departamentos_nombre_lower on public.departamentos using btree(lower(nombre));

-- =====================
-- FUNCIÓN: actualizar updated_at automáticamente
-- =====================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_empresas_updated_at
  before update on public.empresas
  for each row execute function public.handle_updated_at();

create trigger trg_predios_updated_at
  before update on public.predios
  for each row execute function public.handle_updated_at();

create trigger trg_ofertas_updated_at
  before update on public.ofertas
  for each row execute function public.handle_updated_at();

create trigger trg_actividades_updated_at
  before update on public.actividades
  for each row execute function public.handle_updated_at();

-- =====================
-- FUNCIÓN: límite de 5 fotos por oferta
-- =====================
create or replace function public.check_max_fotos()
returns trigger as $$
begin
  if (select count(*) from public.oferta_fotos where oferta_id = new.oferta_id) >= 5 then
    raise exception 'Una oferta no puede tener más de 5 fotos';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_max_fotos
  before insert on public.oferta_fotos
  for each row execute function public.check_max_fotos();

-- =====================
-- FUNCIÓN: límite de 2 hero_imagenes activas
-- =====================
create or replace function public.check_max_hero()
returns trigger as $$
begin
  if new.activo = true and (
    select count(*) from public.hero_imagenes where activo = true and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) >= 2 then
    raise exception 'Solo puede haber 2 imágenes activas en el hero';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_max_hero
  before insert or update on public.hero_imagenes
  for each row execute function public.check_max_hero();

-- =====================
-- FUNCIÓN: auto-inactivar ofertas cuando empresa se inactiva
-- =====================
create or replace function public.handle_empresa_inactiva()
returns trigger as $$
begin
  if new.estado = 'inactiva' and old.estado != 'inactiva' then
    update public.ofertas set activo = false
    where empresa_id = new.id;
  end if;
  if new.estado = 'aprobada' and old.estado = 'inactiva' then
    update public.ofertas set activo = true
    where empresa_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_empresa_inactiva
  after update on public.empresas
  for each row execute function public.handle_empresa_inactiva();
