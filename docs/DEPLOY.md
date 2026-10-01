# Auto-update con GitHub Actions (como tu otra página)

## Cómo funciona

No necesitas un runner en tu casa. GitHub usa sus runners gratis:

```
Cursor/VS Code → git push → GitHub Actions (runner) → POST webhook → Portainer actualiza
```

El archivo `.github/workflows/deploy.yml` ya está en el repo.

## Activarlo (solo una vez)

### 1. Webhook en Portainer

1. **Stacks** → clic en **nexalab**
2. Busca **Webhooks** (a veces en el menú del stack o en Git configuration)
3. Activa / crea el webhook de **Pull and redeploy** / **GitOps update**
4. **Copia la URL** completa (algo como `https://tu-portainer.../api/stacks/webhooks/xxxx`)

Importante: esa URL debe ser alcanzable desde internet (tu dominio Cloudflare de Portainer), no `localhost`.

Si al crear el webhook hay opción **Re-pull image**, déjala **desactivada**  
(nosotros construimos las imágenes en el servidor; el pull a Docker Hub falla).

### 2. Secret en GitHub

1. Abre https://github.com/Advanced52/NEXALAB/settings/secrets/actions
2. **New repository secret**
3. Name: `PORTAINER_WEBHOOK_URL`
4. Value: pega la URL del webhook
5. Save

### 3. Probar

En tu PC:

```powershell
cd C:\Users\Mauro\Desktop\NEXALAB
git add .
git commit -m "Prueba auto-deploy"
git push
```

Luego:
1. GitHub → pestaña **Actions** → debe verse el workflow **Deploy NEXALAB** en verde
2. En Portainer el stack se actualiza solo (1–5 min)

## Día a día

```powershell
cd C:\Users\Mauro\Desktop\NEXALAB
git add .
git commit -m "descripcion del cambio"
git push
```

Listo: se actualiza la web sola.

## Si Actions falla

| Error | Qué hacer |
|--------|-----------|
| Falta `PORTAINER_WEBHOOK_URL` | Crear el secret (paso 2) |
| HTTP 404 / timeout | La URL del webhook debe ser la pública de Cloudflare, no LAN |
| Pull access denied | En el webhook/stack, desactivar “Re-pull image” |

## ¿Runner self-hosted?

Tu otra página podía usar runners de GitHub (en la nube) **o** un runner instalado en el CPU.  
Para NEXALAB con Portainer + webhook, **no hace falta** instalar runner en casa: el de GitHub (`ubuntu-latest`) basta.
