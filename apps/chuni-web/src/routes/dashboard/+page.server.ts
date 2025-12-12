import { error, fail } from "@sveltejs/kit";
import { count, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "$lib/db";
import { getUserStats } from "$lib/functions/userStats";

import { apiKey, jobTable } from "@repo/db-chuni/schema";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { session } = await parent();

  if (!session?.user?.id) {
    error(401, "Unauthorized");
  }

  const [jobResult, apiKeyResult, userStats] = await Promise.all([
    db
      .select({ count: count() })
      .from(jobTable)
      .where(eq(jobTable.userId, session.user.id)),
    db
      .select({ apiKey: apiKey.apiKey, createdAt: apiKey.createdAt })
      .from(apiKey)
      .where(eq(apiKey.userId, session.user.id)),
    getUserStats(session.user.id),
  ]);

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image,
    },
    jobCount: jobResult[0]?.count,
    apiKey: apiKeyResult[0]?.apiKey ?? null,
    apiKeyCreatedAt: apiKeyResult[0]?.createdAt ?? null,
    userStats,
  };
};

export const actions: Actions = {
  generateApiKey: async ({ locals }) => {
    const session = await locals.auth();

    if (!session?.user?.id) {
      return fail(401, { error: "Unauthorized" });
    }

    const newApiKey = nanoid(32);

    await db
      .insert(apiKey)
      .values({
        userId: session.user.id,
        apiKey: newApiKey,
      })
      .onConflictDoUpdate({
        target: apiKey.userId,
        set: {
          apiKey: newApiKey,
          createdAt: new Date(),
        },
      });

    return { success: true, apiKey: newApiKey };
  },
};
