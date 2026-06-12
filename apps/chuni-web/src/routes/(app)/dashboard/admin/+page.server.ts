import { error as kitError, fail } from "@sveltejs/kit";

import { env } from "$env/dynamic/private";
import { clearCachedDb } from "$lib/cachedDb";
import { clearMusicDataCache } from "$lib/functions/musicData";

import { isAdminUser } from "@repo/core/web";

import type { Actions, PageServerLoad } from "./$types";

function isCurrentUserAdmin(userId: string | null | undefined): boolean {
  return isAdminUser(userId, env.ADMIN_USER_ID);
}

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth();

  if (!session?.user?.id) {
    kitError(401, "Unauthorized");
  }

  if (!isCurrentUserAdmin(session.user.id)) {
    kitError(403, "Forbidden");
  }
};

export const actions: Actions = {
  clearAllCache: async ({ locals }) => {
    const session = await locals.auth();

    if (!session?.user?.id) {
      return fail(401, {
        adminSettings: {
          status: "error" as const,
          message: "Unauthorized",
        },
      });
    }

    if (!isCurrentUserAdmin(session.user.id)) {
      return fail(403, {
        adminSettings: {
          status: "error" as const,
          message: "Forbidden",
        },
      });
    }

    clearCachedDb();
    clearMusicDataCache();

    return {
      adminSettings: {
        status: "success" as const,
        message: "All in-memory caches were cleared.",
      },
    };
  },
};
