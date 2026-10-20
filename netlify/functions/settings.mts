import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { storeSettings } from "../../db/schema.js";
import {
  getSettings,
  verifyAdminToken,
  jsonOk,
  jsonError,
} from "./_helpers.mjs";

export default async (req: Request) => {
  // GET /api/settings — public
  if (req.method === "GET") {
    const settings = await getSettings();
    // Omit password hash from public response
    const { adminPasswordHash, ...publicSettings } = settings;
    const hasPassword = !!adminPasswordHash;
    return jsonOk({ ...publicSettings, hasPassword });
  }

  // PUT /api/settings — admin only
  if (req.method === "PUT") {
    const authed = await verifyAdminToken(req);
    if (!authed) return jsonError("Unauthorized", 401);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const settings = await getSettings();
    const updates: Partial<typeof storeSettings.$inferInsert> = {};

    if (body.storeName !== undefined) updates.storeName = String(body.storeName).trim() || "Betania Fragancias";
    if (body.heroTitle !== undefined) updates.heroTitle = String(body.heroTitle).trim();
    if (body.heroSubtitle !== undefined) updates.heroSubtitle = String(body.heroSubtitle).trim();
    if (body.whatsapp !== undefined) updates.whatsapp = String(body.whatsapp).trim();
    if (body.instagram !== undefined) updates.instagram = String(body.instagram).trim();
    if (body.pickupAddress !== undefined) updates.pickupAddress = String(body.pickupAddress).trim();
    if (body.pickupHours !== undefined) updates.pickupHours = String(body.pickupHours).trim();
    if (body.transferAlias !== undefined) updates.transferAlias = String(body.transferAlias).trim();
    if (body.whatsappMessageTemplate !== undefined) updates.whatsappMessageTemplate = String(body.whatsappMessageTemplate);
    if (body.shippingCost !== undefined) updates.shippingCost = Number(body.shippingCost) || 0;

    const [row] = await db
      .update(storeSettings)
      .set(updates)
      .where(eq(storeSettings.id, settings.id))
      .returning();

    const { adminPasswordHash, ...publicSettings } = row;
    const hasPassword = !!adminPasswordHash;
    return jsonOk({ ...publicSettings, hasPassword });
  }

  return jsonError("Method not allowed", 405);
};

export const config: Config = {
  path: "/api/settings",
};
