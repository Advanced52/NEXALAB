# Despliegue en servidor casero (Portainer + GitHub)

Así se actualiza la web sola cada vez que haces push desde VS Code / Cursor.

## Flujo

```
VS Code → git push → GitHub → GitHub Actions → webhook Portainer → rebuild stack
```

## 1. Subir el código a GitHub

Si el repo aún no tiene remoto:

1. Crea un repositorio en GitHub (privado o público).
2. En tu PC:

```bash
cd C:\Users\Mauro\Desktop\NEXALAB
git remote add origin https://github.com/TU_USUARIO/NEXALAB.git
git add .
git commit -m "Prepare production deploy"
git branch -M main
git push -u origin main
```

## 2. Crear el stack en Portainer

1. Abre Portainer → **Stacks** → **Add stack**.
2. Nombre: `nexalab`.
3. Método: **Repository**.
4. Repository URL: `https://github.com/TU_USUARIO/NEXALAB.git`
5. Compose path: `docker-compose.prod.yml`
6. Branch: `main`
7. En **Environment variables** agrega (mínimo):

| Variable | Ejemplo |
|----------|---------|
| `DB_USERNAME` | `nexalab` |
| `DB_PASSWORD` | *(clave fuerte)* |
| `DB_DATABASE` | `bd_nexalab` |
| `JWT_SECRET` | *(mín. 32 caracteres)* |
| `ADMIN_EMAIL` | `admin@tudominio.com` |
| `ADMIN_PASSWORD` | *(clave fuerte)* |
| `APP_URL` | `http://IP_DEL_SERVIDOR:8088` |
| `FRONTEND_URL` | `http://IP_DEL_SERVIDOR:8088` |
| `NEXALAB_HTTP_PORT` | `8088` |

8. Deploy the stack.

La web queda en: `http://IP_DEL_SERVIDOR:8088`

> Si ya tienes PostgreSQL en el servidor, puedes quitar el servicio `postgres` del compose y poner `DB_HOST` con el nombre/IP de ese contenedor (en la misma red Docker).

## 3. Activar auto-update (como tu otra página)

### En Portainer

1. Entra al stack `nexalab`.
2. Abre **Webhooks** (o "Pull and redeploy webhook").
3. Copia la URL del webhook.

### En GitHub

1. Repo → **Settings** → **Secrets and variables** → **Actions**.
2. New secret:
   - Name: `PORTAINER_WEBHOOK_URL`
   - Value: la URL que copiaste

El workflow `.github/workflows/deploy.yml` ya llama a ese webhook en cada push a `main`.

## 4. Día a día

```bash
git add .
git commit -m "tu cambio"
git push
```

En 1–3 minutos Portainer baja el código, reconstruye imágenes y reinicia contenedores.

## 5. pgAdmin

No hace falta otro pgAdmin: usa el que ya tienes.

Datos de conexión al Postgres del stack:

- Host: `nexalab-postgres` (si pgAdmin está en la misma red Docker `nexalab`)  
  o la IP del servidor + puerto publicado si lo expones
- Puerto: `5432`
- DB / user / pass: los de las variables del stack

## 6. Dominio / HTTPS (opcional)

Pon Nginx Proxy Manager, Traefik o Caddy delante del puerto `8088` y apunta tu dominio. Luego actualiza `APP_URL` y `FRONTEND_URL` a `https://tudominio.com`.

## Notas

- Las imágenes subidas viven en el volumen `nexalab_uploads` (no se pierden al redesplegar).
- En producción, cuando el esquema esté estable, cambia `DB_SYNC=false` y usa migraciones.
- El frontend de producción usa nginx (no `ng serve`).
