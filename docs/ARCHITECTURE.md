# NEXALAB — Arquitectura de la plataforma

## 1. Visión

Una sola plataforma **NEXALAB** con múltiples **divisiones** (líneas de negocio) administrables desde un panel, sin aplicaciones separadas ni cambios de código para agregar divisiones.

```
NEXALAB (marca)
  └── business_divisions (NEXA Street, NEXA 3D, NEXA Tech, …)
        └── categories
              └── products | services
                    └── product_variants (talla, color, material, …)
```

## 2. Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Angular + TypeScript |
| Backend | Node.js + NestJS |
| DB | PostgreSQL |
| API | REST |
| Auth | JWT + bcrypt |
| Infra | Docker Compose |

## 3. Estructura monorepo

```
NEXALAB/
├── docker-compose.yml
├── .env.example
├── README.md
├── docs/
│   └── ARCHITECTURE.md
├── backend/                 # NestJS API
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── config/
│       ├── common/          # guards, decorators, filters, pipes, dto base
│       ├── database/        # entities, seed, migrations
│       └── modules/
│           ├── auth/
│           ├── users/
│           ├── roles/
│           ├── divisions/
│           ├── categories/
│           ├── products/
│           ├── variants/
│           ├── services/
│           ├── inventory/
│           ├── orders/
│           ├── customers/
│           ├── cart/
│           ├── uploads/
│           └── settings/
└── frontend/                # Angular
    └── src/app/
        ├── core/            # interceptors, guards, services API, auth
        ├── shared/          # UI reutilizable, pipes, directives
        ├── layout/          # header, footer, shell admin/público
        └── features/
            ├── home/
            ├── divisions/
            ├── shop/
            ├── products/
            ├── services/
            ├── cart/
            ├── checkout/
            ├── auth/
            └── admin/
```

## 4. Entidades y relaciones

### Diagrama ER (simplificado)

```
roles 1──* users
users 1──0..1 customers

business_divisions 1──* categories
business_divisions 1──* products
business_divisions 1──* services

categories 1──* products
categories 1──* services

products 1──* product_images
products 1──* product_variants
products 1──* inventory (opcional por producto/variante)

sizes *──* product_variants (vía attributes JSON o tablas size/color)
colors *──* product_variants

customers 1──* orders
orders 1──* order_items
order_items → product | service | variant + division snapshot

cart 1──* cart_items
cart → user (auth) | session_id (guest)

settings (clave/valor JSON para CMS: hero, SEO global, etc.)
```

### Tablas mínimas

| Tabla | Propósito |
|-------|-----------|
| `roles` | admin, customer, staff |
| `users` | autenticación |
| `customers` | perfil comercial |
| `business_divisions` | divisiones NEXA* |
| `categories` | por división |
| `products` | físicos / comercializables |
| `product_images` | galería |
| `product_variants` | SKU/stock/precio por combinación |
| `sizes` / `colors` | catálogos de atributos |
| `services` | servicios (cotización o precio) |
| `inventory` | movimientos / stock |
| `orders` / `order_items` | pedidos multi-división |
| `carts` / `cart_items` | carrito global |
| `settings` | contenido editable (hero, etc.) |

### `business_divisions`

- id, name, slug (unique), description, short_description
- logo_url, banner_url, primary_color
- is_active, sort_order
- seo_title, seo_description, og_image
- created_at, updated_at

### `products`

- id, division_id, category_id
- type: `physical` | (servicios viven en `services`)
- name, slug, short_description, description
- price, compare_at_price, sku, stock, weight, dimensions (JSON)
- is_active, is_featured
- seo_title, seo_description
- timestamps

### `services`

- id, division_id, category_id
- name, slug, description, image_url
- price_type: `fixed` | `from` | `quote`
- price (nullable), duration_approx
- is_active, is_featured
- seo_*
- timestamps

### `product_variants`

- id, product_id
- sku, stock, price (nullable = hereda)
- size_id, color_id (nullable)
- attributes JSON (material, etc.)
- image_url
- is_active

### `orders` / `order_items`

- Pedido único NEXALAB; cada ítem guarda `division_id` + snapshot de nombre/precio para histórico.
- payment_method: payphone | stripe | paypal | transfer | pending
- status: pending | confirmed | processing | shipped | completed | cancelled

## 5. Módulos NestJS

Cada módulo: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `entities/` (o centralizadas en `database/entities`).

| Módulo | Responsabilidad |
|--------|-----------------|
| auth | login, register, JWT, refresh opcional |
| users / roles | gestión usuarios |
| divisions | CRUD divisiones (público + admin) |
| categories | CRUD por división |
| products | CRUD + listados tienda |
| variants | variantes de producto |
| services | CRUD servicios + solicitudes |
| inventory | stock |
| customers | perfiles |
| cart | carrito guest/auth |
| orders | checkout + admin pedidos |
| uploads | imágenes locales/S3-ready |
| settings | CMS (hero, textos) |

## 6. Rutas API (REST)

Prefijo: `/api/v1`

### Público

- `GET /divisions` — activas ordenadas
- `GET /divisions/:slug`
- `GET /divisions/:slug/categories`
- `GET /divisions/:slug/products`
- `GET /divisions/:slug/services`
- `GET /categories/:slug`
- `GET /products` — tienda (filtros: division, category, price, availability, type)
- `GET /products/:slug`
- `GET /services/:slug`
- `POST /services/:slug/requests` — solicitar servicio
- `GET|POST|PATCH|DELETE /cart` / `/cart/items`
- `POST /checkout`
- `GET /settings/public`
- `POST /auth/login` | `POST /auth/register`

### Admin (`/admin/...`, JWT + RolesGuard)

- CRUD: divisions, categories, products, variants, services, orders, customers, users, inventory, settings, uploads

## 7. Rutas Frontend (Angular)

### Público

| Ruta | Feature |
|------|---------|
| `/` | home |
| `/:divisionSlug` | división dinámica |
| `/:divisionSlug/:categorySlug` | categoría |
| `/:divisionSlug/:categorySlug/:productSlug` | producto/servicio |
| `/tienda` | shop global |
| `/carrito` | cart |
| `/checkout` | checkout |
| `/auth/login` | auth |

> Resolución de rutas: `divisionSlug` validado contra API; no hardcodear divisiones.

### Admin

| Ruta | Feature |
|------|---------|
| `/admin` | dashboard |
| `/admin/divisions` | … |
| `/admin/categories` | … |
| `/admin/products` | … |
| `/admin/services` | … |
| `/admin/orders` | … |
| `/admin/customers` | … |
| `/admin/inventory` | … |
| `/admin/users` | … |
| `/admin/settings` | … |

## 8. Flujo de datos

1. **Home** → `GET /divisions` + `GET /settings/public` (hero editable).
2. **División** → slug → división + categorías + productos/servicios de esa división.
3. **Tienda** → `GET /products` con query params de filtros.
4. **Carrito** → un solo carrito; cada ítem incluye `division` para UI y pedidos.
5. **Checkout** → crea `order` + `order_items` (sin pasarela real en v1).
6. **Admin** → CRUD; nueva división → aparece en home sin redeploy de lógica de rutas (ruta `/:slug`).

## 9. Seguridad

- Passwords: bcrypt
- JWT en header `Authorization: Bearer`
- RolesGuard + `@Roles('admin')`
- ValidationPipe global (class-validator)
- CORS configurado por env
- Rate limiting (Throttler) en auth/checkout
- Secretos solo en `.env` (nunca en frontend)

## 10. Docker Compose

Servicios: `postgres`, `backend`, `frontend`, opcional `pgadmin`.

Volúmenes: datos PG, uploads.

## 11. Fases de implementación

1. Arquitectura + PostgreSQL + NestJS (entidades, Docker, config)
2. Auth + users + roles
3. Divisions + categories + products + services (+ seed)
4. Panel admin
5. Frontend público
6. Páginas dinámicas divisiones
7. Tienda
8. Carrito + checkout
9. Pedidos
10. SEO + responsive + optimización

## 12. Principios

- Una marca, muchas divisiones configurables.
- Cero rutas/componentes hardcodeados por división.
- Pedidos y carrito multi-división.
- Productos físicos y servicios en el mismo ecosistema.
- Extensible (cupones, pagos, cotizaciones) sin romper el modelo.
