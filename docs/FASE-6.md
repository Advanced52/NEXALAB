# Fase 6 — Completada

## Qué se implementó

- Página dinámica reutilizable `/:slug` (sin componentes hardcodeados por división)
- Carga desde API: nombre, logo, banner, descripción, color, categorías, productos, servicios
- SEO dinámico (title, meta description, Open Graph)
- Señal clara “Parte de NEXALAB”
- Responsive

## Ejemplos

- `/nexa-street`
- `/nexa-3d`
- `/nexa-tech`
- `/nexa-robotics`

Agregar una división nueva en el admin la hace aparecer automáticamente en home y accesible por su slug.

## Cómo probar

Con backend + seed activos:

```bash
curl http://localhost:3000/api/v1/divisions/nexa-street
```

En el navegador: http://localhost:4200/nexa-street
