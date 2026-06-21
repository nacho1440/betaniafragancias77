# Betania Fragancias

Tienda online de perfumes árabes con panel de administración. Permite gestionar el catálogo de productos, recibir pedidos de clientes y configurar los datos de la tienda desde un panel de admin web.

## Tecnologías

- **Frontend**: HTML + CSS + JavaScript vanilla (sin framework)
- **Backend**: Netlify Functions (TypeScript, Node.js)
- **Base de datos**: Netlify Database (PostgreSQL) con Drizzle ORM
- **Hosting**: Netlify

## Cómo correr localmente

```bash
npm install
netlify dev
```

El sitio estará en `http://localhost:8888`.

- Tienda: `http://localhost:8888/`
- Panel admin: `http://localhost:8888/admin.html`

## Variables de entorno

Netlify Database se provisiona automáticamente. No se requieren variables adicionales.
