import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { orders } from "../../db/schema.js";
import { verifyAdminToken, jsonOk, jsonError } from "./_helpers.mjs";

export default async (req: Request, context: Context) => {
  if (req.method !== "PUT") return jsonError("Method not allowed", 405);

  const authed = await verifyAdminToken(req);
  if (!authed) return jsonError("Unauthorized", 401);

  const id = context.params.id;
  let body: { estado?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const allowed = ["Nuevo", "Confirmado", "Entregado", "Cancelado"];
  const estado = body.estado || "";
  if (!allowed.includes(estado)) return jsonError("Invalid estado", 400);

  const [row] = await db
    .update(orders)
    .set({ estado })
    .where(eq(orders.id, id))
    .returning();
  if (!row) return jsonError("Not found", 404);
  return jsonOk(row);
};

export const config: Config = {
  path: "/api/orders/:id",
};
