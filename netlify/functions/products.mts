import type { Config } from "@netlify/functions";
import { eq, asc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { verifyAdminToken, jsonOk, jsonError } from "./_helpers.mjs";

export default async (req: Request) => {
  // GET /api/products — public (active only) or admin (all)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const admin = url.searchParams.get("admin") === "true";
    if (admin) {
      const authed = await verifyAdminToken(req);
      if (!authed) return jsonError("Unauthorized", 401);
      const rows = await db
        .select()
        .from(products)
        .orderBy(asc(products.createdAt));
      return jsonOk(rows);
    }
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.activo, true))
      .orderBy(asc(products.createdAt));
    return jsonOk(rows);
  }

  // POST /api/products — admin only
  if (req.method === "POST") {
    const authed = await verifyAdminToken(req);
    if (!authed) return jsonError("Unauthorized", 401);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const nombre = String(body.nombre || "").trim();
    const precio = Number(body.precio) || 0;
    const stock = Number(body.stock) || 0;
    const stockMinimo = body.stockMinimo !== undefined ? Number(body.stockMinimo) || 0 : 3;
    if (!nombre) return jsonError("nombre is required", 400);
    if (precio < 0) return jsonError("precio invalid", 400);
    if (stock < 0) return jsonError("stock invalid", 400);
    if (stockMinimo < 0) return jsonError("stockMinimo invalid", 400);

    const id = "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const [row] = await db
      .insert(products)
      .values({
        id,
        nombre,
        marca: String(body.marca || "").trim(),
        categoria: String(body.categoria || "unisex"),
        descripcion: String(body.descripcion || "").trim(),
        descripcionCorta: String(body.descripcionCorta || "").trim(),
        caracteristicas: String(body.caracteristicas || "").trim(),
        precio,
        stock,
        stockMinimo,
        imagen: String(body.imagen || ""),
        activo: body.activo !== false,
      })
      .returning();
    return jsonOk(row, 201);
  }

  return jsonError("Method not allowed", 405);
};

export const config: Config = {
  path: "/api/products",
};
