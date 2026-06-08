/**
 * Computes the target URL when swapping between Chunithm and Maimai applications.
 * Preserves the path if it is one of the interchangeable app routes,
 * otherwise defaults to routing to the home page (/).
 *
 * @param rawBaseUrl - The target application's configured base URL (e.g. env.PUBLIC_MAIMAI_URL)
 * @param currentPath - The current page pathname (e.g. page.url.pathname)
 * @returns The complete normalized target URL, or an empty string if base URL is not set
 */
export const appSwapAllowedPaths = [
  "/data",
  "/about",
  "/dashboard",
  "/dashboard/activity",
  "/dashboard/milestones",
  "/dashboard/jobs",
  "/dashboard/settings",
] as const;

export function getSwapUrl(
  rawBaseUrl: string | undefined,
  currentPath: string,
): string {
  if (!rawBaseUrl) return "";

  // Normalize base URL by removing any trailing slash
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  const targetPath = appSwapAllowedPaths.includes(
    currentPath as (typeof appSwapAllowedPaths)[number],
  )
    ? currentPath
    : "";

  return `${baseUrl}${targetPath || "/"}`;
}
