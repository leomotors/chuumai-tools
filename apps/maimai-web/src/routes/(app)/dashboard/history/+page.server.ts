import { getDashboardPlayHistory } from "$lib/functions/dashboardMusic";

import { getNextPlayHistoryLimit, parsePlayHistoryLimit } from "@repo/core/web";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent, url }) => {
  const { user } = await parent();
  const limit = parsePlayHistoryLimit(url.searchParams.get("limit"));

  const rows = await getDashboardPlayHistory(user.id, limit + 1);
  const history = rows.slice(0, limit);
  const hasMore = rows.length > limit;

  return {
    history,
    limit,
    hasMore,
    nextLimit: getNextPlayHistoryLimit(limit, hasMore),
  };
};
