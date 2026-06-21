CREATE TABLE "orders" (
	"id" text PRIMARY KEY,
	"fecha" timestamp DEFAULT now(),
	"nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"entrega" text NOT NULL,
	"direccion" text DEFAULT '',
	"pago" text NOT NULL,
	"notas" text DEFAULT '',
	"items" jsonb NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"shipping" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"estado" text DEFAULT 'Nuevo' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"nombre" text NOT NULL,
	"marca" text DEFAULT '',
	"categoria" text DEFAULT 'unisex' NOT NULL,
	"descripcion" text DEFAULT '',
	"precio" integer DEFAULT 0 NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"imagen" text DEFAULT '',
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" serial PRIMARY KEY,
	"store_name" text DEFAULT 'Betania Fragancias' NOT NULL,
	"hero_title" text DEFAULT 'Encontrá tu fragancia ideal' NOT NULL,
	"hero_subtitle" text DEFAULT 'Perfumes árabes seleccionados, al mejor precio. Envíos a todo el país o retiro en el local.' NOT NULL,
	"whatsapp" text DEFAULT '',
	"instagram" text DEFAULT 'betania_fragancias',
	"pickup_address" text DEFAULT '',
	"pickup_hours" text DEFAULT '',
	"shipping_cost" integer DEFAULT 0 NOT NULL,
	"admin_password_hash" text DEFAULT '',
	"updated_at" timestamp DEFAULT now()
);
