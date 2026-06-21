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

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const action = url.pathname.replace(/^\/api\/admin\/?/, "").split("?")[0];

  if (req.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  // POST /api/admin/setup — first-time password creation
  if (action === "setup") {
    const settings = await getSettings();
    if (settings.adminPasswordHash) {
      return jsonError("Password already set", 403);
    }
    const { password } = body;
    if (!password || password.length < 6) {
      return jsonError("Password too short", 400);
    }
    const hash = await sha256(password);
    await db
      .update(storeSettings)
      .set({ adminPasswordHash: hash })
      .where(eq(storeSettings.id, settings.id));
    return jsonOk({ ok: true, token: hash });
  }

  // POST /api/admin/login
  if (action === "login") {
    const settings = await getSettings();
    if (!settings.adminPasswordHash) {
      return jsonError("No password set", 404);
    }
    const { password } = body;
    if (!password) return jsonError("Missing password", 400);
    const hash = await sha256(password);
    if (hash !== settings.adminPasswordHash) {
      return jsonError("Invalid password", 401);
    }
    return jsonOk({ ok: true, token: hash });
  }

  // POST /api/admin/change-password
  if (action === "change-password") {
    const authed = await verifyAdminToken(req);
    if (!authed) return jsonError("Unauthorized", 401);
    const settings = await getSettings();
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return jsonError("Missing fields", 400);
    }
    if (newPassword.length < 6) {
      return jsonError("New password too short", 400);
    }
    const currentHash = await sha256(currentPassword);
    if (currentHash !== settings.adminPasswordHash) {
      return jsonError("Current password incorrect", 401);
    }
    const newHash = await sha256(newPassword);
    await db
      .update(storeSettings)
      .set({ adminPasswordHash: newHash })
      .where(eq(storeSettings.id, settings.id));
    return jsonOk({ ok: true, token: newHash });
  }

  // POST /api/admin/verify
  if (action === "verify") {
    const authed = await verifyAdminToken(req);
    if (!authed) return jsonError("Unauthorized", 401);
    return jsonOk({ ok: true });
  }

  return jsonError("Not found", 404);
};

export const config: Config = {
  path: "/api/admin/:action",
};
