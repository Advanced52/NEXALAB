# Fase 5 — Completada

## Qué se implementó

- Sitio público NEXALAB en Angular
- Layout público con logos oficiales (header horizontal + footer)
- Home con hero de marca (logo, headline, CTA) alimentado por `settings/public`
- Sección **Explora NEXALAB** con tarjetas de divisiones dinámicas
- Tipografía Outfit + identidad negro/cian/blanco
- Skeletons, estados vacíos y errores de API
- Tipografía y motion suaves (entrada + hover)

## Rutas públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Home NEXALAB |
| `/tienda` | Tienda global (base Fase 7) |
| `/admin` | Panel (sin cambios) |

## Cómo probar

```bash
cd backend && npm run start:dev
cd frontend && npm start
```

Abrir http://localhost:4200/

El hero se edita desde `/admin/settings`.

## Nota

La página dinámica de división (`/:slug`) se implementó junto con la Fase 6 para que las tarjetas del home naveguen correctamente.
