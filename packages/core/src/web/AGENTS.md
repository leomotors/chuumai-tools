## Application Swap Routes

When adding a route that exists in both `apps/chuni-web` and `apps/maimai-web`,
update `appSwapAllowedPaths` in `swapUrl.ts` and its tests so the navbar
application swap preserves the matching page.
