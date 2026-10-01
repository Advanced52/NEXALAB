# Fase 1 — Completada

## Qué se implementó

- Arquitectura documentada en `docs/ARCHITECTURE.md`
- Monorepo NEXALAB con `backend/` NestJS
- Docker Compose (`postgres`, `backend`, `frontend` profile, `pgadmin` profile)
- Variables de entorno (`.env.example`)
- 17 entidades TypeORM con relaciones, índices y timestamps
- Enums de dominio (órdenes, pagos, servicios, inventario, carrito)
- Configuración modular (`app`, `database`)
- Módulos stub preparados para fases siguientes
- Endpoint `GET /api/v1/health`
- ValidationPipe global + CORS

## Archivos principales

| Ruta | Descripción |
|------|-------------|
| `docs/ARCHITECTURE.md` | Diseño completo |
| `docker-compose.yml` | Infra local |
| `.env.example` | Plantilla de secretos |
| `backend/src/database/entities/*` | Modelo de datos |
| `backend/src/app.module.ts` | Wiring NestJS |
| `backend/src/main.ts` | Bootstrap API |
| `backend/src/modules/*` | Módulos (stubs + health) |

## Cómo probar

1. Copiar entorno: `cp .env.example .env`
2. Levantar PostgreSQL: `docker compose up -d postgres`
3. Backend: `cd backend && npm install && npm run start:dev`
4. Abrir: http://localhost:3000/api/v1/health

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "nexalab-api",
  "database": "up",
  ...
}
```

Si `database` es `"down"`, verifica que Postgres esté corriendo y las credenciales en `.env`.

## Siguiente: Fase 2

Auth JWT + usuarios + roles + seed del administrador.
