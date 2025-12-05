import { error } from "@sveltejs/kit";
import { count, eq } from "drizzle-orm";

import { db } from "$lib/db";

import { jobTable } from "@repo/db-chuni/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { session } = await parent();

  if (!session?.user?.id) {
    error(401, "Unauthorized");
  }

  const result = await db
    .select({ count: count() })
    .from(jobTable)
    .where(eq(jobTable.userId, session.user.id));

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image,
    },
    jobCount: result[0]?.count,
  };
};
