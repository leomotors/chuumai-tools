import { fail, redirect } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "$lib/db";

import { apiKey } from "@repo/database/chuni";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  redirect(302, "/dashboard/activity");
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
          createdAt: sql`now()`,
        },
      });

    return { success: true, apiKey: newApiKey };
  },
};
