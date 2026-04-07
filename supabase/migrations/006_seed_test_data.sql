-- =====================
-- SEED DE DATOS DE PRUEBA
-- =====================
-- Nota: Las migraciones corren como superusuario (bypass RLS)

-- =====================
-- EMPRESAS DE PRUEBA
-- =====================
insert into public.empresas (id, nit, nombre, telefono, correo, encargado_nombre, encargado_telefono, estado) values
  ('e1000000-0000-0000-0000-000000000001', '900123456-1', 'Inmobiliaria Los Andes', '3101234567', 'contacto@losandes.com.co', 'Carlos Ramírez', '3101234567', 'aprobada'),
  ('e1000000-0000-0000-0000-000000000002', '900234567-2', 'Grupo Habitare Colombia', '3202345678', 'info@habitare.com.co', 'Valentina Torres', '3202345678', 'aprobada'),
  ('e1000000-0000-0000-0000-000000000003', '900345678-3', 'Costa Norte Propiedades', '3153456789', 'ventas@costanorte.com.co', 'Andrés Martínez', '3153456789', 'aprobada');

-- =====================
-- ACTIVAR ACTIVIDADES EN LANDING
-- =====================
update public.actividades
set mostrar_en_landing = true, orden_landing = 1
where nombre = 'Senderismo';

update public.actividades
set mostrar_en_landing = true, orden_landing = 2
where nombre = 'Piscina';

update public.actividades
set mostrar_en_landing = true, orden_landing = 3
where nombre = 'Ecoturismo';

update public.actividades
set mostrar_en_landing = true, orden_landing = 4
where nombre = 'Ciclismo';

update public.actividades
set mostrar_en_landing = true, orden_landing = 5
where nombre = 'Golf';

update public.actividades
set mostrar_en_landing = true, orden_landing = 6
where nombre = 'Turismo cultural';

update public.actividades
set mostrar_en_landing = true, orden_landing = 7
where nombre = 'Playas cercanas';

update public.actividades
set mostrar_en_landing = true, orden_landing = 8
where nombre = 'Kayak';

-- =====================
-- PREDIOS DE PRUEBA
-- =====================
insert into public.predios (id, matricula, metros_cuadrados, municipio_id, tipo_inmueble_id, destacado) values
  -- Antioquia
  ('a1000000-0000-0000-0000-000000000001', 'ANT-001-2024', 280.00,
    (select id from public.municipios where nombre ilike 'Medellín' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Apartamento'), true),

  ('a1000000-0000-0000-0000-000000000002', 'ANT-002-2024', 1200.00,
    (select id from public.municipios where nombre ilike 'Rionegro' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Lote'), true),

  ('a1000000-0000-0000-0000-000000000003', 'ANT-003-2024', 350.00,
    (select id from public.municipios where nombre ilike 'Marinilla' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Casa'), true),

  -- Cundinamarca / Bogotá
  ('a1000000-0000-0000-0000-000000000004', 'CUN-001-2024', 95.00,
    (select id from public.municipios where nombre ilike 'Bogotá D.C.' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Apartamento'), true),

  ('a1000000-0000-0000-0000-000000000005', 'CUN-002-2024', 5000.00,
    (select id from public.municipios where nombre ilike 'Chía' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Finca'), false),

  -- Bolívar
  ('a1000000-0000-0000-0000-000000000006', 'BOL-001-2024', 180.00,
    (select id from public.municipios where nombre ilike 'Cartagena' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Apartamento'), true),

  ('a1000000-0000-0000-0000-000000000007', 'BOL-002-2024', 750.00,
    (select id from public.municipios where nombre ilike 'Cartagena' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Casa'), false),

  -- Valle del Cauca
  ('a1000000-0000-0000-0000-000000000008', 'VAL-001-2024', 420.00,
    (select id from public.municipios where nombre ilike 'Cali' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Casa'), true),

  -- Risaralda (Eje Cafetero)
  ('a1000000-0000-0000-0000-000000000009', 'RIS-001-2024', 2800.00,
    (select id from public.municipios where nombre ilike 'Pereira' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Conjunto Residencial'), true),

  -- Santander
  ('a1000000-0000-0000-0000-000000000010', 'SAN-001-2024', 600.00,
    (select id from public.municipios where nombre ilike 'Bucaramanga' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Casa'), false),

  -- Magdalena
  ('a1000000-0000-0000-0000-000000000011', 'MAG-001-2024', 140.00,
    (select id from public.municipios where nombre ilike 'Santa Marta' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Apartamento'), true),

  -- Nariño
  ('a1000000-0000-0000-0000-000000000012', 'NAR-001-2024', 3500.00,
    (select id from public.municipios where nombre ilike 'Pasto' limit 1),
    (select id from public.tipos_inmueble where nombre = 'Lote'), false);

-- =====================
-- OFERTAS DE PRUEBA
-- =====================
insert into public.ofertas (id, predio_id, empresa_id, precio, descripcion, activo) values
  -- Empresa 1 - Los Andes
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001',
    380000000, 'Moderno apartamento en el corazón de Medellín con acabados de lujo. Cerca de parques y zona comercial. Vista panorámica a las montañas.', true),

  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001',
    220000000, 'Lote exclusivo en Rionegro con todos los servicios. Ideal para construir casa campestre. Zona de alta valorización.', true),

  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002',
    395000000, 'Apartamento amplio en Medellín con parqueadero incluido. Acceso a zonas comunes con piscina y gimnasio.', true),

  -- Empresa 2 - Habitare
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000002',
    650000000, 'Hermosa casa en Marinilla cerca al embalse del Peñol. Rodeada de naturaleza, perfecta para descanso y turismo. Acceso a actividades acuáticas.', true),

  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000002',
    520000000, 'Apartamento moderno en Bogotá D.C. Ubicación estratégica cerca de universidades y centros comerciales.', true),

  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000002',
    1800000000, 'Finca campestre en Chía con acceso privado. 5 hectáreas de terreno, casa principal y caballerizas. Impresionante vista a Bogotá.', true),

  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000009', 'e1000000-0000-0000-0000-000000000002',
    850000000, 'Conjunto residencial en Pereira con piscina, cancha de tenis y zonas verdes. 28 unidades disponibles.', true),

  -- Empresa 3 - Costa Norte
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000003',
    680000000, 'Apartamento frente al mar en Cartagena. Acceso directo a playa privada. Perfecta inversión turística o residencia vacacional.', true),

  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000003',
    950000000, 'Casa colonial en zona histórica de Cartagena. Patio interior, 4 habitaciones y terraza. A pasos del centro amurallado.', true),

  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000003',
    480000000, 'Casa moderna en urbanización exclusiva de Cali. Piscina privada, jardín y acceso a club deportivo.', true),

  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000011', 'e1000000-0000-0000-0000-000000000003',
    420000000, 'Apartamento en Santa Marta a 5 minutos de la playa. Edificio con rooftop, piscina y vista al mar Caribe.', true),

  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000001',
    380000000, 'Casa en Bucaramanga en barrio tranquilo. 3 habitaciones, 2 baños, garaje doble y jardín posterior.', true),

  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000012', 'e1000000-0000-0000-0000-000000000001',
    95000000, 'Lote urbanizable en Pasto con vistas a los volcanes. Ideal para proyecto residencial o casa propia.', true);

-- =====================
-- ACTIVIDADES POR OFERTA
-- =====================

-- Apartamento Medellín (empresa 1) — piscina, gimnasio, ciclismo
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000001', (select id from public.actividades where nombre = 'Piscina')),
  ('b1000000-0000-0000-0000-000000000001', (select id from public.actividades where nombre = 'Gimnasio')),
  ('b1000000-0000-0000-0000-000000000001', (select id from public.actividades where nombre = 'Ciclismo'));

-- Lote Rionegro — senderismo, ecoturismo, ciclismo
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000002', (select id from public.actividades where nombre = 'Senderismo')),
  ('b1000000-0000-0000-0000-000000000002', (select id from public.actividades where nombre = 'Ecoturismo')),
  ('b1000000-0000-0000-0000-000000000002', (select id from public.actividades where nombre = 'Ciclismo'));

-- Apartamento Medellín (empresa 2) — piscina, gimnasio, turismo cultural
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000003', (select id from public.actividades where nombre = 'Piscina')),
  ('b1000000-0000-0000-0000-000000000003', (select id from public.actividades where nombre = 'Gimnasio')),
  ('b1000000-0000-0000-0000-000000000003', (select id from public.actividades where nombre = 'Turismo cultural'));

-- Casa Guatapé — kayak, senderismo, pesca, ecoturismo
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000004', (select id from public.actividades where nombre = 'Kayak')),
  ('b1000000-0000-0000-0000-000000000004', (select id from public.actividades where nombre = 'Senderismo')),
  ('b1000000-0000-0000-0000-000000000004', (select id from public.actividades where nombre = 'Pesca')),
  ('b1000000-0000-0000-0000-000000000004', (select id from public.actividades where nombre = 'Ecoturismo'));

-- Apartamento Bogotá — turismo cultural, ciclismo
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000005', (select id from public.actividades where nombre = 'Turismo cultural')),
  ('b1000000-0000-0000-0000-000000000005', (select id from public.actividades where nombre = 'Ciclismo'));

-- Finca La Calera — senderismo, equitación, ecoturismo, canopy
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000006', (select id from public.actividades where nombre = 'Senderismo')),
  ('b1000000-0000-0000-0000-000000000006', (select id from public.actividades where nombre = 'Equitación')),
  ('b1000000-0000-0000-0000-000000000006', (select id from public.actividades where nombre = 'Ecoturismo')),
  ('b1000000-0000-0000-0000-000000000006', (select id from public.actividades where nombre = 'Canopy'));

-- Conjunto Pereira — piscina, cancha de tenis, gimnasio, zona BBQ
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000007', (select id from public.actividades where nombre = 'Piscina')),
  ('b1000000-0000-0000-0000-000000000007', (select id from public.actividades where nombre = 'Cancha de tenis')),
  ('b1000000-0000-0000-0000-000000000007', (select id from public.actividades where nombre = 'Gimnasio')),
  ('b1000000-0000-0000-0000-000000000007', (select id from public.actividades where nombre = 'Zona de BBQ'));

-- Apartamento Cartagena — playas cercanas, kayak, turismo cultural
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000008', (select id from public.actividades where nombre = 'Playas cercanas')),
  ('b1000000-0000-0000-0000-000000000008', (select id from public.actividades where nombre = 'Kayak')),
  ('b1000000-0000-0000-0000-000000000008', (select id from public.actividades where nombre = 'Turismo cultural'));

-- Casa Cartagena histórica — turismo cultural, playas cercanas
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000009', (select id from public.actividades where nombre = 'Turismo cultural')),
  ('b1000000-0000-0000-0000-000000000009', (select id from public.actividades where nombre = 'Playas cercanas'));

-- Casa Cali — piscina, zona BBQ, golf
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000010', (select id from public.actividades where nombre = 'Piscina')),
  ('b1000000-0000-0000-0000-000000000010', (select id from public.actividades where nombre = 'Zona de BBQ')),
  ('b1000000-0000-0000-0000-000000000010', (select id from public.actividades where nombre = 'Golf'));

-- Apartamento Santa Marta — playas cercanas, kayak, ecoturismo
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000011', (select id from public.actividades where nombre = 'Playas cercanas')),
  ('b1000000-0000-0000-0000-000000000011', (select id from public.actividades where nombre = 'Kayak')),
  ('b1000000-0000-0000-0000-000000000011', (select id from public.actividades where nombre = 'Ecoturismo'));

-- Casa Bucaramanga — senderismo, ciclismo, zona BBQ
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000012', (select id from public.actividades where nombre = 'Senderismo')),
  ('b1000000-0000-0000-0000-000000000012', (select id from public.actividades where nombre = 'Ciclismo')),
  ('b1000000-0000-0000-0000-000000000012', (select id from public.actividades where nombre = 'Zona de BBQ'));

-- Lote Pasto — senderismo, ecoturismo
insert into public.oferta_actividades (oferta_id, actividad_id) values
  ('b1000000-0000-0000-0000-000000000013', (select id from public.actividades where nombre = 'Senderismo')),
  ('b1000000-0000-0000-0000-000000000013', (select id from public.actividades where nombre = 'Ecoturismo'));
