import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { orders } from "../../db/schema.js";
import type { OrderItem } from "../../db/schema.js";
import { verifyAdminToken, jsonOk, jsonError } from "./_helpers.mjs";

export default async (req: Request) => {
  // GET /api/orders — admin only
  if (req.method === "GET") {
    const authed = await verifyAdminToken(req);
    if (!authed) return jsonError("Unauthorized", 401);
    const rows = await db.select().from(orders).orderBy(desc(orders.fecha));
    return jsonOk(rows);
  }

  // POST /api/orders — public (from store checkout)
  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const nombre = String(body.nombre || "").trim();
    const telefono = String(body.telefono || "").trim();
    const entrega = String(body.entrega || "retiro");
    const items = (body.items as OrderItem[]) || [];

    if (!nombre || !telefono) return jsonError("nombre and telefono required", 400);
    if (!items.length) return jsonError("items is empty", 400);

    const id = "ord_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const subtotal = Number(body.subtotal) || 0;
    const shipping = Number(body.shipping) || 0;
    const total = Number(body.total) || 0;

    const [row] = await db
      .insert(orders)
      .values({
        id,
        nombre,
        telefono,
        entrega,
        direccion: String(body.direccion || "").trim(),
        pago: String(body.pago || "efectivo"),
        notas: String(body.notas || "").trim(),
        items,
        subtotal,
        shipping,
        total,
        estado: "Nuevo",
      })
      .returning();
    return jsonOk(row, 201);
  }

  return jsonError("Method not allowed", 405);
};

export const config: Config = {
  path: "/api/orders",
};
