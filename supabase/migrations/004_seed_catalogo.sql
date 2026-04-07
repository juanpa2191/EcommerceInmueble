-- =====================
-- SEED: CATÁLOGO INICIAL
-- =====================

-- Tipos de inmueble
insert into public.tipos_inmueble (nombre) values
  ('Casa'),
  ('Apartamento'),
  ('Lote'),
  ('Conjunto Residencial'),
  ('Urbanización'),
  ('Finca'),
  ('Local Comercial');

-- Actividades iniciales
insert into public.actividades (nombre, tipo, activo, mostrar_en_landing) values
  ('Senderismo', 'entorno', true, true),
  ('Ciclismo', 'entorno', true, true),
  ('Piscina', 'interna', true, true),
  ('Zona de BBQ', 'interna', true, false),
  ('Gimnasio', 'interna', true, false),
  ('Golf', 'entorno', true, true),
  ('Turismo cultural', 'entorno', true, true),
  ('Pesca', 'entorno', true, false),
  ('Kayak', 'entorno', true, false),
  ('Spa', 'interna', true, false),
  ('Parque infantil', 'interna', true, false),
  ('Ecoturismo', 'entorno', true, true),
  ('Canopy', 'entorno', true, false),
  ('Equitación', 'entorno', true, false),
  ('Playas cercanas', 'entorno', true, true),
  ('Zona de coworking', 'interna', true, false),
  ('Cancha de tenis', 'interna', true, false),
  ('Salón comunal', 'interna', true, false),
  ('Seguridad 24h', 'interna', true, false),
  ('Portería', 'interna', true, false);
