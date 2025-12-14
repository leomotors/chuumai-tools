import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

import { db } from "$lib/db";

import { apiKey } from "@repo/database/chuni";

/**
 * Get user ID from API key.
 * Throws 401 error if API key is invalid or not found.
 */
export async function getUserIdFromApiKey(key: string): Promise<string> {
  const result = await db
    .select({ userId: apiKey.userId })
    .from(apiKey)
    .where(eq(apiKey.apiKey, key))
    .limit(1);

  if (result.length === 0) {
    error(401, "Invalid API key");
  }

  return result[0].userId;
}

/**
 * Get user ID from request using either session or API key.
 * Checks Authorization Bearer header first, then falls back to session.
 * Throws 401 error if neither is valid.
 */
export async function getUserIdFromRequest(
  request: Request,
  locals: App.Locals,
): Promise<string> {
  // Check for API key in Authorization header (Bearer scheme)
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const apiKey = authHeader.substring(7); // Remove "Bearer " prefix
    return getUserIdFromApiKey(apiKey);
  }

  // Fall back to session authentication
  const session = await locals.auth();

  if (!session?.user?.id) {
    error(401, "Unauthorized: Provide a valid Bearer token or session");
  }

  return session.user.id;
}
