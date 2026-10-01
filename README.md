# NEXALAB Platform

Plataforma web unificada de **NEXALAB**: sitio corporativo, catálogo, tienda y panel administrativo con divisiones dinámicas (NEXA Street, NEXA 3D, NEXA Tech, NEXA Robotics, etc.).

## Stack

- **Frontend:** Angular + TypeScript
- **Backend:** NestJS + TypeORM
- **Base de datos:** PostgreSQL 16
- **Auth:** JWT
- **Infra:** Docker Compose

## Arquitectura

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requisitos

- Node.js 22+
- npm 10+
- Docker + Docker Compose (recomendado)
- PostgreSQL 16 (si no usas Docker)

## Inicio rápido (desarrollo)

### 1. Variables de entorno

```bash
cp .env.example .env
```

### 2. Base de datos

Con Docker (solo PostgreSQL):

```bash
docker compose up -d postgres
```

Opcional pgAdmin:

```bash
docker compose --profile tools up -d
```

### 3. Backend

```bash
cd backend
npm install
npm run start:dev
```

API: `http://localhost:3000/api/v1`  
Health: `http://localhost:3000/api/v1/health`

### 4. Frontend

Se implementa en fases posteriores. Cuando exista:

```bash
cd frontend
npm install
npm start
```

## Despliegue (servidor casero)

Ver [docs/DEPLOY.md](docs/DEPLOY.md): Portainer + GitHub → auto-update en cada `git push`.

## Fases

| Fase | Estado | Contenido |
|------|--------|-----------|
| 1 | Completada | Arquitectura + NestJS + PostgreSQL + entidades + Docker |
| 2 | Completada | Auth JWT + usuarios + roles |
| 3 | Completada | Divisiones + categorías + productos + servicios |
| 4 | Completada | Panel administrativo |
| 5 | Completada | Frontend público |
| 6 | Completada | Páginas dinámicas de divisiones |
| 7 | Completada | Tienda |
| 8 | Pendiente | Carrito + checkout |
| 9 | Pendiente | Pedidos |
| 10 | Pendiente | SEO + responsive + optimización |

## Principio clave

Agregar una división (ej. NEXA Home) se hace desde el panel admin: **sin modificar código**.
