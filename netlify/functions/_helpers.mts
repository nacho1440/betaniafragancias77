import { db } from "../../db/index.js";
import { storeSettings } from "../../db/schema.js";

export async function getSettings() {
  const rows = await db.select().from(storeSettings).limit(1);
  if (rows.length === 0) {
    await db.insert(storeSettings).values({}).returning();
    const inserted = await db.select().from(storeSettings).limit(1);
    return inserted[0];
  }
  return rows[0];
}

export async function verifyAdminToken(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  const settings = await getSettings();
  return !!settings.adminPasswordHash && token === settings.adminPasswordHash;
}

export function jsonOk(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
