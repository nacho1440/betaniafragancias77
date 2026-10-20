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
## Publicación y acceso desde otros dispositivos

El sitio está configurado para publicarse en Netlify: `netlify.toml` indica que los archivos públicos están en `public/` y que la API se ejecuta desde `netlify/functions/`. Para que otras personas puedan entrar y para que el catálogo, el stock y los pedidos funcionen, el repositorio debe estar conectado a un sitio de Netlify y la base de datos de Netlify debe estar habilitada. Los cambios subidos a GitHub se reflejan en la web cuando Netlify completa correctamente el despliegue; la configuración de ese sitio y su URL pública no se determinan desde este repositorio.
