# Historias de Usuario — InmuebleVida

Plataforma SaaS multi-tenant de finca raíz colombiana.
Marca cada historia con `[x]` al verificarla manualmente en el navegador.

---

## Flujo Público

### Landing Page
- [x] **US-01** — Como visitante, puedo ver la landing page con el hero visual (imágenes con gradiente cuando no hay fotos en Storage)
- [x] **US-02** — Como visitante, puedo ver la sección de propiedades destacadas con tarjetas que muestran precio, ubicación, tipo y m²
- [x] **US-03** — Como visitante, puedo ver la sección de actividades (senderismo, piscina, etc.) debajo de las destacadas
- [x] **US-04** — Como visitante, el navbar tiene el buscador sticky visible al hacer scroll

### Búsqueda
- [x] **US-05** — Como visitante, puedo escribir en el buscador del navbar y ver sugerencias de autocompletado (municipios)
- [x] **US-06** — Como visitante, al seleccionar una sugerencia o buscar, soy redirigido a `/buscar` con los resultados
- [x] **US-07** — Como visitante, en `/buscar` puedo filtrar por tipo de inmueble y ver solo ese tipo
- [x] **US-08** — Como visitante, puedo filtrar por precio con un range slider en COP (muestra valor mínimo y máximo en tiempo real)
- [x] **US-09** — Como visitante, puedo filtrar por superficie con un range slider en m² (muestra valor mínimo y máximo en tiempo real)
- [x] **US-10** — Como visitante, puedo seleccionar actividades como chips/tags para filtrar inmuebles que las tengan
- [x] **US-11** — Como visitante, los filtros son contextuales — solo aparecen actividades y tipos presentes en los resultados actuales
- [x] **US-12** — Como visitante, puedo limpiar todos los filtros con un botón y volver a ver todos los resultados
- [x] **US-13** — Como visitante en mobile, puedo abrir el panel de filtros desde un Sheet lateral
- [x] **US-14** — Como visitante, si no hay resultados veo un estado vacío descriptivo

### Detalle de Inmueble
- [x] **US-15** — Como visitante, puedo hacer click en una tarjeta y ver el detalle del inmueble en `/inmueble/[matricula]`
- [x] **US-16** — Como visitante, veo la galería de fotos en un carrusel con indicadores (o placeholder si no hay fotos)
- [x] **US-17** — Como visitante, veo el tipo de inmueble, municipio, departamento y m²
- [x] **US-18** — Como visitante, veo las actividades disponibles del inmueble como chips
- [x] **US-19** — Como visitante, veo la descripción del inmueble
- [x] **US-20** — Como visitante, si hay **1 empresa** ofertando, veo el precio y un botón directo de WhatsApp con mensaje pre-cargado
- [x] **US-21** — Como visitante, si hay **múltiples empresas** ofertando el mismo inmueble, veo "Disponible con X empresas" y un botón "Ver todas las ofertas"
- [x] **US-22** — Como visitante, al abrir "Ver todas las ofertas" aparece un bottom sheet con precio, descripción y botón WhatsApp por cada empresa
- [x] **US-23** — Como visitante, al hacer click en WhatsApp se abre wa.me con mensaje pre-cargado que incluye tipo, municipio, m² y precio

---

## Autenticación

- [ ] **US-24** — Como usuario, puedo ir a `/login` y ver el formulario de inicio de sesión
- [ ] **US-25** — Como usuario, puedo iniciar sesión con email y contraseña válidos
- [ ] **US-26** — Como usuario, si ingreso credenciales incorrectas veo un mensaje de error inline
- [ ] **US-27** — Como usuario, puedo iniciar sesión con Google OAuth y ser redirigido a mi panel
- [ ] **US-28** — Como usuario autenticado, el navbar muestra mi nombre/email con un menú desplegable
- [ ] **US-29** — Como usuario autenticado, el menú del navbar tiene un link a "Panel Admin" o "Panel Empresa" según mi rol
- [ ] **US-30** — Como usuario autenticado, puedo cerrar sesión desde el menú del navbar
- [ ] **US-31** — Como nueva empresa, puedo ir a `/registro` y completar el wizard de 2 pasos (cuenta + datos empresa)
- [ ] **US-32** — Como nueva empresa registrada, veo la pantalla de "Registro exitoso — pendiente de aprobación"
- [ ] **US-33** — Como empresa pendiente, NO puedo publicar ofertas (mensaje de error si lo intenta)
- [ ] **US-34** — Un usuario empresa que intenta acceder a `/admin/**` es redirigido a su dashboard

---

## Panel Empresa

### Dashboard
- [ ] **US-35** — Como empresa aprobada, puedo acceder a `/empresa/dashboard` con mi nombre y estado
- [ ] **US-36** — Como empresa, veo 4 tarjetas de métricas: total ofertas, activas, vistas totales, clicks WhatsApp
- [ ] **US-37** — Como empresa, veo la tabla de mis últimas 5 ofertas con matrícula, municipio, precio, estado y métricas
- [ ] **US-38** — Como empresa pendiente, veo un banner amarillo de advertencia en el dashboard

### Crear Oferta (Wizard 4 pasos)
- [ ] **US-39** — Como empresa, puedo ir a "Nueva oferta" y ver el wizard con indicador de pasos
- [ ] **US-40** — En el **Paso 1**, ingreso matrícula, tipo de inmueble, m², precio y descripción con validación en tiempo real
- [ ] **US-41** — Si ingreso una matrícula que ya existe en el sistema, los campos del predio se auto-completan
- [ ] **US-42** — En el **Paso 2**, selecciono el municipio desde un Select agrupado por departamento
- [ ] **US-43** — En el **Paso 3**, selecciono actividades internas y del entorno como chips toggle
- [ ] **US-44** — En el **Paso 4**, subo hasta 5 fotos con drag-and-drop y veo previews con botón de eliminar
- [ ] **US-45** — Al enviar, las fotos se suben a Supabase Storage y soy redirigido al dashboard
- [ ] **US-46** — Si hay un error al crear, veo el mensaje de error sin perder los datos del formulario

### Editar Oferta
- [ ] **US-47** — Como empresa, puedo ir a editar una oferta y ver el wizard pre-cargado con los datos existentes
- [ ] **US-48** — Los campos del predio (matrícula, tipo, municipio) aparecen deshabilitados al editar

---

## Panel Admin

### Dashboard
- [ ] **US-49** — Como admin, puedo acceder a `/admin/dashboard` y ver las 6 tarjetas de métricas globales
- [ ] **US-50** — Como admin, veo la tabla de empresas pendientes de aprobación con Aprobar/Rechazar
- [ ] **US-51** — Como admin, si no hay empresas pendientes veo el estado vacío "Todo al día"
- [ ] **US-52** — Un usuario empresa que intenta acceder a `/admin/**` es redirigido, no puede ver el panel

### Gestión de Empresas
- [ ] **US-53** — Como admin, en `/admin/empresas` veo todas las empresas con tabs: Todas / Pendientes / Aprobadas / Inactivas
- [ ] **US-54** — Como admin, puedo aprobar una empresa pendiente y el badge cambia a verde
- [ ] **US-55** — Como admin, puedo suspender/inactivar una empresa aprobada
- [ ] **US-56** — Como admin, puedo reactivar una empresa inactiva
- [ ] **US-57** — Al suspender una empresa, sus ofertas pasan automáticamente a inactivas (trigger en DB)

### Gestión de Actividades
- [ ] **US-58** — Como admin, en `/admin/actividades` veo la lista de actividades con tipo, estado y configuración de landing
- [ ] **US-59** — Como admin, puedo crear una nueva actividad con nombre y tipo (interna/entorno)
- [ ] **US-60** — Como admin, puedo activar/desactivar una actividad con un toggle
- [ ] **US-61** — Como admin, puedo marcar una actividad para mostrar en landing y asignarle un orden
- [ ] **US-69** — Como admin, puedo subir o cambiar la imagen de una actividad desde la tabla (drag o clic); veo un preview en miniatura
- [ ] **US-70** — Como visitante, las actividades del landing muestran la imagen subida por el admin; si no tiene imagen se muestra un gradiente de color

### Gestión de Hero Images
- [ ] **US-62** — Como admin, en `/admin/hero` veo las imágenes actuales del hero con preview
- [ ] **US-63** — Como admin, puedo subir una nueva imagen al hero con drag-and-drop (va a Supabase Storage)
- [ ] **US-64** — Como admin, puedo asociar una imagen hero con una actividad (para el filtro clickable del landing)
- [ ] **US-65** — Como admin, puedo activar/desactivar imágenes del hero
- [ ] **US-66** — El sistema no permite más de 2 imágenes activas en el hero (restricción de DB)
- [ ] **US-71** — Como admin, al eliminar una imagen hero el archivo se borra también del Storage (sin archivos huérfanos)
- [ ] **US-72** — Como admin, si intento subir una imagen mayor a 5 MB recibo un error descriptivo antes de que se intente el upload

### Gestión de Tipos y Geografía
- [ ] **US-67** — Como admin, en `/admin/tipos` puedo crear nuevos tipos de inmueble y activar/desactivar existentes
- [ ] **US-68** — Como admin, en `/admin/geografico` puedo buscar municipios y ver el listado agrupado por departamento

---

## Seguridad (verificación técnica)

- [ ] **SEC-01** — Una empresa autenticada NO puede llamar directamente a `aprobarEmpresa()` (retorna "No autorizado")
- [ ] **SEC-02** — Una empresa NO puede modificar ofertas de otra empresa mediante `actualizarOferta()`
- [ ] **SEC-03** — Una empresa pendiente/inactiva NO puede crear ofertas
- [ ] **SEC-04** — El parámetro `next` en `/auth/callback` no acepta URLs externas (open redirect bloqueado)
- [ ] **SEC-05** — Los RPC counters solo incrementan en ofertas activas

---

## Resumen

| Categoría | Total | Completadas |
|-----------|-------|-------------|
| Flujo Público | 23 | 23 |
| Autenticación | 11 | — |
| Panel Empresa | 14 | — |
| Panel Admin | 24 | — |
| Seguridad | 5 | — |
| **TOTAL** | **77** | **23 / 77** |

> Actualizar el conteo manualmente o usar `grep -c '\- \[x\]' HISTORIAS_USUARIO.md` para contar las completadas.
