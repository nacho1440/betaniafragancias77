import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";

export type OrderItem = {
  id: string;
  nombre: string;
  precio: number;
  qty: number;
};

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  marca: text("marca").default(""),
  categoria: text("categoria").notNull().default("unisex"),
  descripcion: text("descripcion").default(""),
  precio: integer("precio").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  imagen: text("imagen").default(""),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  fecha: timestamp("fecha").defaultNow(),
  nombre: text("nombre").notNull(),
  telefono: text("telefono").notNull(),
  entrega: text("entrega").notNull(),
  direccion: text("direccion").default(""),
  pago: text("pago").notNull(),
  notas: text("notas").default(""),
  items: jsonb("items").notNull().$type<OrderItem[]>(),
  subtotal: integer("subtotal").notNull().default(0),
  shipping: integer("shipping").notNull().default(0),
  total: integer("total").notNull().default(0),
  estado: text("estado").notNull().default("Nuevo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull().default("Betania Fragancias"),
  heroTitle: text("hero_title").notNull().default("Encontrá tu fragancia ideal"),
  heroSubtitle: text("hero_subtitle").notNull().default(
    "Perfumes árabes seleccionados, al mejor precio. Envíos a todo el país o retiro en el local."
  ),
  whatsapp: text("whatsapp").default(""),
  instagram: text("instagram").default("betania_fragancias"),
  pickupAddress: text("pickup_address").default(""),
  pickupHours: text("pickup_hours").default(""),
  shippingCost: integer("shipping_cost").notNull().default(0),
  adminPasswordHash: text("admin_password_hash").default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});
