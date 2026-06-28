import { error } from "@sveltejs/kit";
import { count, eq } from "drizzle-orm";

import { env } from "$env/dynamic/private";
import { db } from "$lib/db";
import { getUserStats } from "$lib/functions/userStats";

import { isAdminUser } from "@repo/core/web";
import { jobTable } from "@repo/database/maimai";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent }) => {
  const { session } = await parent();

  if (!session?.user?.id) {
    error(401, "Unauthorized");
  }

  const [jobResult, userStats] = await Promise.all([
    db
      .select({ count: count() })
      .from(jobTable)
      .where(eq(jobTable.userId, session.user.id)),
    getUserStats(session.user.id),
  ]);

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image,
    },
    isAdmin: isAdminUser(session.user.id, env.ADMIN_USER_ID),
    jobCount: jobResult[0]?.count,
    userStats,
  };
};
