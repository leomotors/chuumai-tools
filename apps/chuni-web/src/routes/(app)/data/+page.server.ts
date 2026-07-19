import { env } from "$env/dynamic/private";

import { isAdminUser } from "@repo/core/web";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth();

  return {
    isAdmin: isAdminUser(session?.user?.id, env.ADMIN_USER_ID),
  };
};
