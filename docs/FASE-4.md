# Fase 4 — Completada

## Qué se implementó

- Proyecto Angular 21 (`frontend/`)
- Identidad visual basada en logos oficiales NEXALAB (sin modificar assets)
- Panel `/admin` con autenticación JWT
- Menú: Dashboard, Divisiones, Categorías, Productos, Servicios, Pedidos, Clientes, Inventario, Usuarios, Configuración
- CRUD funcional: Divisiones, Categorías, Productos, Servicios
- Listado de usuarios
- Edición del hero (`settings`)
- Placeholders para Pedidos / Clientes / Inventario (fases siguientes)
- Toasts (sin `alert()` nativo salvo confirmaciones de borrado)
- Responsive (sidebar colapsable en móvil)

## Logos usados

| Archivo | Uso |
|---------|-----|
| `assets/brand/icon.png` | Favicon / header móvil |
| `assets/brand/logo-dark.png` | Login (fondo oscuro) |
| `assets/brand/logo-horizontal.png` | Sidebar admin |
| `assets/brand/logo-light.png` | Reservado para sitio claro |

Colores: negro `#000`, cian `#34B3F1`, blanco.

## Cómo probar

1. Backend en `http://localhost:3000`
2. Frontend:

```bash
cd frontend
npm start
```

3. Abrir: http://localhost:4200/admin/login
4. Login con credenciales de `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

## Siguiente: Fase 5

Frontend público NEXALAB (home + explorar divisiones).
