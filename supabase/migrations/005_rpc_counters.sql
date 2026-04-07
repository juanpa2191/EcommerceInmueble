-- Función para incrementar vistas de forma atómica
create or replace function public.increment_vistas(oferta_id uuid)
returns void as $$
  update public.ofertas
  set vistas = vistas + 1
  where id = oferta_id;
$$ language sql security definer;

-- Función para incrementar clicks de whatsapp de forma atómica
create or replace function public.increment_whatsapp(oferta_id uuid)
returns void as $$
  update public.ofertas
  set clicks_whatsapp = clicks_whatsapp + 1
  where id = oferta_id;
$$ language sql security definer;
