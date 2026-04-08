-- Agrega columna activo a tipos_inmueble (faltaba en el schema inicial)
alter table public.tipos_inmueble
  add column if not exists activo boolean not null default true;
