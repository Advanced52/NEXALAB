# Fase 2 — Completada

## Qué se implementó

- Autenticación JWT (`Passport` + `@nestjs/jwt`)
- Hash de contraseñas con **bcrypt** (12 rounds)
- Roles del sistema: `admin`, `staff`, `customer`
- Seed automático de roles + administrador (credenciales desde `.env`)
- Guards globales: `JwtAuthGuard`, `RolesGuard`, `ThrottlerGuard`
- Decorators: `@Public()`, `@Roles()`, `@CurrentUser()`
- Endpoints de auth y administración de usuarios

## Endpoints

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/v1/auth/register` | Público | Registro cliente |
| POST | `/api/v1/auth/login` | Público | Login → JWT |
| GET | `/api/v1/auth/me` | JWT | Perfil actual |
| GET | `/api/v1/admin/users` | Admin | Listar usuarios |
| POST | `/api/v1/admin/users` | Admin | Crear usuario |
| GET | `/api/v1/admin/users/:id` | Admin | Detalle |
| PATCH | `/api/v1/admin/users/:id` | Admin | Actualizar |
| DELETE | `/api/v1/admin/users/:id` | Admin | Eliminar |
| GET | `/api/v1/admin/roles` | Admin | Listar roles |

## Archivos creados/modificados

- `src/modules/auth/*` — login, register, JWT strategy
- `src/modules/users/*` — CRUD usuarios + roles
- `src/common/guards/*`, `src/common/decorators/*`
- `src/database/database-seed.service.ts` — seed roles + admin
- `src/app.module.ts` — guards globales
- Corrección: TypeORM fijado a `0.3.26`

## Cómo probar

1. Asegurar PostgreSQL y `.env` configurado.
2. `cd backend && npm run start:dev`
3. Login admin:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@nexalab.local\",\"password\":\"ChangeMeAdmin123!\"}"
```

4. Usar el `accessToken` en:

```bash
curl http://localhost:3000/api/v1/auth/me ^
  -H "Authorization: Bearer TOKEN"
```

Credenciales admin: variables `ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env` (no hardcodeadas en código).

## Siguiente: Fase 3

CRUD de divisiones, categorías, productos y servicios + seed de datos de prueba.
