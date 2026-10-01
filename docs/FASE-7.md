# Fase 7 — Completada

## Qué se implementó

- Tienda global `/tienda` con filtros:
  - División
  - Categoría
  - Precio min/max
  - Disponibilidad
  - Tipo (physical/digital)
  - Búsqueda
- Filtros sincronizados con query params (URLs compartibles)
- Página de categoría `/:division/:category`
- Detalle de producto/servicio `/:division/:category/:slug`
- Variantes (talla/color), galería, stock y precio
- SEO dinámico en producto/categoría
- Componente reutilizable `ProductCard`
- Carrito local (preparación Fase 8): agregar, ver `/carrito`, contador en header
- Toast: “Producto agregado al carrito.”

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/tienda` | Catálogo filtrable |
| `/tienda?division=nexa-street&inStock=true` | Ejemplo de filtros |
| `/nexa-street/camisetas` | Categoría |
| `/nexa-street/camisetas/camiseta-ya-que-chucha` | Producto |
| `/carrito` | Carrito global multi-división |

## Cómo probar

```bash
cd backend && npm run start:dev
cd frontend && npm start
```

1. http://localhost:4200/tienda
2. Abrir un producto y agregar al carrito
3. Ver contador en header y `/carrito`

## Siguiente: Fase 8

Checkout completo (datos de cliente, método de pago pendiente, creación de pedido en API).
