import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { verifyAdminToken, jsonOk, jsonError } from "./_helpers.mjs";

export default async (req: Request, context: Context) => {
  const id = context.params.id;
  const authed = await verifyAdminToken(req);
  if (!authed) return jsonError("Unauthorized", 401);

  // GET /api/products/:id
  if (req.method === "GET") {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    if (!row) return jsonError("Not found", 404);
    return jsonOk(row);
  }

  // PUT /api/products/:id
  if (req.method === "PUT") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const updates: Partial<typeof products.$inferInsert> = {};
    if (body.nombre !== undefined) updates.nombre = String(body.nombre).trim();
    if (body.marca !== undefined) updates.marca = String(body.marca).trim();
    if (body.categoria !== undefined) updates.categoria = String(body.categoria);
    if (body.descripcion !== undefined) updates.descripcion = String(body.descripcion).trim();
    if (body.descripcionCorta !== undefined) updates.descripcionCorta = String(body.descripcionCorta).trim();
    if (body.caracteristicas !== undefined) updates.caracteristicas = String(body.caracteristicas).trim();
    if (body.precio !== undefined) updates.precio = Number(body.precio);
    if (body.stock !== undefined) updates.stock = Number(body.stock);
    if (body.stockMinimo !== undefined) updates.stockMinimo = Number(body.stockMinimo);
    if (body.imagen !== undefined) updates.imagen = String(body.imagen);
    if (body.activo !== undefined) updates.activo = Boolean(body.activo);

    const [row] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    if (!row) return jsonError("Not found", 404);
    return jsonOk(row);
  }

  // DELETE /api/products/:id
  if (req.method === "DELETE") {
    await db.delete(products).where(eq(products.id, id));
    return jsonOk({ ok: true });
  }

  return jsonError("Method not allowed", 405);
};

export const config: Config = {
  path: "/api/products/:id",
};
