# Fase 3 — Completada

## Qué se implementó

- CRUD completo de **divisiones**, **categorías**, **productos**, **servicios** y **variantes**
- Endpoints públicos + admin (JWT + roles)
- Filtros de tienda en `GET /products` (división, categoría, precio, stock, tipo, búsqueda)
- Settings públicos (`home.hero` editable)
- Seed de catálogo de prueba NEXALAB
- Tallas (S–XXL) y colores (Negro, Blanco, Gris)
- Variantes de ejemplo para “YA QUE CHUCHA...”

## Seed de datos

| División | Categoría | Productos / Servicios |
|----------|-----------|------------------------|
| NEXA Street | Camisetas | YA QUE CHUCHA..., DEJATE DE WEBADAS, Camiseta NEXALAB |
| NEXA 3D | Piezas | Pieza personalizada 3D |
| NEXA Tech | Servicios tecnológicos | Diagnóstico y reparación de PC |
| NEXA Robotics | Proyectos | Desarrollo de proyecto electrónico |

Imágenes: placeholders `placehold.co` hasta que se suban las reales.

## Endpoints públicos

| Método | Ruta |
|--------|------|
| GET | `/api/v1/divisions` |
| GET | `/api/v1/divisions/:slug` (con categorías, productos, servicios) |
| GET | `/api/v1/divisions/:slug/categories` |
| GET | `/api/v1/divisions/:slug/products` |
| GET | `/api/v1/divisions/:slug/services` |
| GET | `/api/v1/products` (filtros query) |
| GET | `/api/v1/products/:slug` |
| GET | `/api/v1/services` |
| GET | `/api/v1/services/:slug` |
| GET | `/api/v1/settings/public` |
| GET | `/api/v1/sizes` / `/api/v1/colors` |

## Endpoints admin

| Prefijo | Acciones |
|---------|----------|
| `/api/v1/admin/divisions` | CRUD |
| `/api/v1/admin/categories` | CRUD |
| `/api/v1/admin/products` | CRUD |
| `/api/v1/admin/services` | CRUD |
| `/api/v1/admin/variants` | crear / editar / eliminar |
| `/api/v1/admin/settings` | listar / upsert |

## Cómo probar

1. Configurar PostgreSQL y `.env`
2. `cd backend && npm run start:dev`
3. Verificar seed en logs: roles, admin, catálogo
4. Probar:

```bash
curl http://localhost:3000/api/v1/divisions
curl http://localhost:3000/api/v1/divisions/nexa-street
curl http://localhost:3000/api/v1/products
curl http://localhost:3000/api/v1/settings/public
```

Crear nueva división (sin tocar código):

```bash
curl -X POST http://localhost:3000/api/v1/admin/divisions ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"NEXA Home\",\"slug\":\"nexa-home\",\"shortDescription\":\"Línea hogar\",\"sortOrder\":5}"
```

## Siguiente: Fase 4

Panel administrativo Angular.
