# AGENTS.md — Guía de arquitectura para agentes AI

## Estructura del proyecto

```
/
├── public/             # Archivos estáticos servidos por Netlify
│   ├── index.html      # Tienda pública (catalog, carrito, checkout)
│   ├── admin.html      # Panel de administración protegido por contraseña
│   └── images/         # Imágenes de productos (estáticas)
│
├── netlify/
│   ├── functions/      # API serverless (TypeScript .mts)
│   │   ├── _helpers.mts      # Helpers compartidos (auth, json responses)
│   │   ├── products.mts      # GET /api/products, POST /api/products
│   │   ├── product.mts       # GET/PUT/DELETE /api/products/:id
│   │   ├── orders.mts        # GET /api/orders, POST /api/orders
│   │   ├── order.mts         # PUT /api/orders/:id
│   │   ├── settings.mts      # GET/PUT /api/settings
│   │   └── admin.mts         # POST /api/admin/:action (setup/login/change-password/verify)
│   └── database/
│       └── migrations/       # SQL migrations (auto-aplicadas por Netlify)
│
├── db/
│   ├── schema.ts       # Definición de tablas Drizzle ORM
│   └── index.ts        # Cliente de base de datos
│
├── drizzle.config.ts   # Config de drizzle-kit (output → netlify/database/migrations)
├── netlify.toml        # publish = "public"
└── package.json
```

## Tablas de base de datos

- **`products`**: Catálogo de productos. Campos: id (text PK), nombre, marca, categoria, descripcion, precio, stock, imagen (base64), activo, created_at.
- **`orders`**: Pedidos de clientes. Campos: id (text PK), fecha, nombre, telefono, entrega, direccion, pago, notas, items (jsonb), subtotal, shipping, total, estado, created_at.
- **`store_settings`**: Configuración de la tienda. Una sola fila. Campos: id (serial), storeName, heroTitle, heroSubtitle, whatsapp, instagram, pickupAddress, pickupHours, shippingCost, adminPasswordHash, updatedAt.

## Autenticación del admin

- La contraseña se hashea con SHA-256 y se guarda en `store_settings.admin_password_hash`.
- Al hacer login (`POST /api/admin/login`), el servidor devuelve el hash como "token" (`{ token: "<sha256>" }`).
- El panel admin almacena el token en `sessionStorage` y lo envía como `Authorization: Bearer <token>` en cada petición protegida.
- El servidor valida comparando el header con el hash almacenado en DB.

## Flujo de datos

1. **Tienda (index.html)**: Carga productos y settings desde la API al iniciar. El carrito se guarda en `localStorage` del usuario. Al hacer checkout, envía el pedido a `POST /api/orders` y abre WhatsApp.
2. **Admin (admin.html)**: Todas las operaciones (CRUD productos, ver pedidos, guardar settings) van a la API con autenticación Bearer.
3. **API (netlify/functions)**: Funciones TypeScript que leen/escriben en PostgreSQL via Drizzle ORM.

## Convenciones

- Las funciones usan `.mts` (TypeScript ES modules).
- Los imports internos usan extensión `.mjs` (convención TypeScript para `.mts`).
- Funciones privadas (no expuestas como endpoints) empiezan con `_` (e.g. `_helpers.mts`).
- Las migraciones se generan con `npx drizzle-kit generate` y NUNCA se aplican manualmente.
- Para agregar columnas/tablas: modificar `db/schema.ts` y ejecutar `npx drizzle-kit generate`.
