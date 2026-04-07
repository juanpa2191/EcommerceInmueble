-- =====================
-- SECURITY FIXES
-- =====================

-- 1. Corregir RPC counters: agregar set search_path y filtrar solo ofertas activas
create or replace function public.increment_vistas(oferta_id uuid)
returns void as $$
  update public.ofertas
  set vistas = vistas + 1
  where id = oferta_id
    and activo = true;
$$ language sql security definer
   set search_path = public;

create or replace function public.increment_whatsapp(oferta_id uuid)
returns void as $$
  update public.ofertas
  set clicks_whatsapp = clicks_whatsapp + 1
  where id = oferta_id
    and activo = true;
$$ language sql security definer
   set search_path = public;

-- 2. Corregir policy de insert en empresas: requiere usuario autenticado
drop policy if exists "empresas_insert_public" on public.empresas;
create policy "empresas_insert_public" on public.empresas
  for insert with check (auth.uid() is not null);

-- 3. Corregir policy de update en empresas: empresa no puede cambiar su propio estado
drop policy if exists "empresas_update_own" on public.empresas;
create policy "empresas_update_own" on public.empresas
  for update
  using (id = public.get_user_empresa_id())
  with check (
    -- El estado no puede ser modificado por la propia empresa
    estado = (select estado from public.empresas where id = public.get_user_empresa_id())
  );
