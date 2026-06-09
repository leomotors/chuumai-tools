import { getDashboardPlayHistory } from "$lib/functions/dashboardMusic";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();

  return {
    history: await getDashboardPlayHistory(user.id),
  };
};
