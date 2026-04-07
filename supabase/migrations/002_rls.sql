-- =====================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =====================
alter table public.empresas enable row level security;
alter table public.usuarios enable row level security;
alter table public.departamentos enable row level security;
alter table public.municipios enable row level security;
alter table public.tipos_inmueble enable row level security;
alter table public.actividades enable row level security;
alter table public.hero_imagenes enable row level security;
alter table public.predios enable row level security;
alter table public.ofertas enable row level security;
alter table public.oferta_fotos enable row level security;
alter table public.oferta_actividades enable row level security;

-- =====================
-- FUNCIÓN HELPER: obtener rol del usuario actual
-- =====================
create or replace function public.get_user_rol()
returns varchar as $$
  select rol from public.usuarios where id = auth.uid();
$$ language sql security definer stable;

-- =====================
-- FUNCIÓN HELPER: obtener empresa_id del usuario actual
-- =====================
create or replace function public.get_user_empresa_id()
returns uuid as $$
  select empresa_id from public.usuarios where id = auth.uid();
$$ language sql security definer stable;

-- =====================
-- POLÍTICAS: DEPARTAMENTOS (lectura pública)
-- =====================
create policy "departamentos_select_public" on public.departamentos
  for select using (true);

create policy "departamentos_all_admin" on public.departamentos
  for all using (public.get_user_rol() = 'admin');

-- =====================
-- POLÍTICAS: MUNICIPIOS (lectura pública)
-- =====================
create policy "municipios_select_public" on public.municipios
  for select using (true);

create policy "municipios_all_admin" on public.municipios
  for all using (public.get_user_rol() = 'admin');

-- =====================
-- POLÍTICAS: TIPOS_INMUEBLE (lectura pública)
-- =====================
create policy "tipos_select_public" on public.tipos_inmueble
  for select using (true);

create policy "tipos_all_admin" on public.tipos_inmueble
  for all using (public.get_user_rol() = 'admin');

-- =====================
-- POLÍTICAS: ACTIVIDADES (lectura pública de activas)
-- =====================
create policy "actividades_select_public" on public.actividades
  for select using (activo = true);

create policy "actividades_all_admin" on public.actividades
  for all using (public.get_user_rol() = 'admin');

-- =====================
-- POLÍTICAS: HERO_IMAGENES (lectura pública de activas)
-- =====================
create policy "hero_select_public" on public.hero_imagenes
  for select using (activo = true);

create policy "hero_all_admin" on public.hero_imagenes
  for all using (public.get_user_rol() = 'admin');

-- =====================
-- POLÍTICAS: PREDIOS (lectura pública)
-- =====================
create policy "predios_select_public" on public.predios
  for select using (true);

create policy "predios_insert_empresa" on public.predios
  for insert with check (public.get_user_rol() in ('admin', 'empresa'));

create policy "predios_update_admin" on public.predios
  for update using (public.get_user_rol() = 'admin');

create policy "predios_delete_admin" on public.predios
  for delete using (public.get_user_rol() = 'admin');

-- =====================
-- POLÍTICAS: OFERTAS
-- =====================
create policy "ofertas_select_public" on public.ofertas
  for select using (activo = true);

create policy "ofertas_select_empresa_own" on public.ofertas
  for select using (empresa_id = public.get_user_empresa_id());

create policy "ofertas_select_admin" on public.ofertas
  for select using (public.get_user_rol() = 'admin');

create policy "ofertas_insert_empresa" on public.ofertas
  for insert with check (
    public.get_user_rol() = 'empresa'
    and empresa_id = public.get_user_empresa_id()
  );

create policy "ofertas_update_empresa_own" on public.ofertas
  for update using (
    public.get_user_rol() = 'empresa'
    and empresa_id = public.get_user_empresa_id()
  );

create policy "ofertas_all_admin" on public.ofertas
  for all using (public.get_user_rol() = 'admin');

-- =====================
-- POLÍTICAS: OFERTA_FOTOS
-- =====================
create policy "oferta_fotos_select_public" on public.oferta_fotos
  for select using (true);

create policy "oferta_fotos_insert_empresa" on public.oferta_fotos
  for insert with check (
    exists (
      select 1 from public.ofertas
      where id = oferta_id
      and empresa_id = public.get_user_empresa_id()
    )
  );

create policy "oferta_fotos_delete_empresa" on public.oferta_fotos
  for delete using (
    exists (
      select 1 from public.ofertas
      where id = oferta_id
      and empresa_id = public.get_user_empresa_id()
    )
  );

create policy "oferta_fotos_all_admin" on public.oferta_fotos
  for all using (public.get_user_rol() = 'admin');

-- =====================
-- POLÍTICAS: OFERTA_ACTIVIDADES
-- =====================
create policy "oferta_act_select_public" on public.oferta_actividades
  for select using (true);

create policy "oferta_act_insert_empresa" on public.oferta_actividades
  for insert with check (
    exists (
      select 1 from public.ofertas
      where id = oferta_id
      and empresa_id = public.get_user_empresa_id()
    )
  );

create policy "oferta_act_delete_empresa" on public.oferta_actividades
  for delete using (
    exists (
      select 1 from public.ofertas
      where id = oferta_id
      and empresa_id = public.get_user_empresa_id()
    )
  );

create policy "oferta_act_all_admin" on public.oferta_actividades
  for all using (public.get_user_rol() = 'admin');

-- =====================
-- POLÍTICAS: EMPRESAS
-- =====================
create policy "empresas_select_admin" on public.empresas
  for select using (public.get_user_rol() = 'admin');

create policy "empresas_select_own" on public.empresas
  for select using (id = public.get_user_empresa_id());

create policy "empresas_insert_public" on public.empresas
  for insert with check (true);

create policy "empresas_update_admin" on public.empresas
  for update using (public.get_user_rol() = 'admin');

create policy "empresas_update_own" on public.empresas
  for update using (id = public.get_user_empresa_id());

-- =====================
-- POLÍTICAS: USUARIOS
-- =====================
create policy "usuarios_select_own" on public.usuarios
  for select using (id = auth.uid());

create policy "usuarios_select_admin" on public.usuarios
  for select using (public.get_user_rol() = 'admin');

create policy "usuarios_insert_own" on public.usuarios
  for insert with check (id = auth.uid());

create policy "usuarios_update_admin" on public.usuarios
  for update using (public.get_user_rol() = 'admin');
