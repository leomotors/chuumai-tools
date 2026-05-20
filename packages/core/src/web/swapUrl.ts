/**
 * Computes the target URL when swapping between Chunithm and Maimai applications.
 * Preserves the path if it is one of the interchangeable routes (/data, /about, /dashboard),
 * otherwise defaults to routing to the home page (/).
 *
 * @param rawBaseUrl - The target application's configured base URL (e.g. env.PUBLIC_MAIMAI_URL)
 * @param currentPath - The current page pathname (e.g. page.url.pathname)
 * @returns The complete normalized target URL, or an empty string if base URL is not set
 */
export function getSwapUrl(
  rawBaseUrl: string | undefined,
  currentPath: string,
): string {
  if (!rawBaseUrl) return "";

  // Normalize base URL by removing any trailing slash
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  const allowedPaths = ["/data", "/about", "/dashboard"];
  const targetPath = allowedPaths.includes(currentPath) ? currentPath : "";

  return `${baseUrl}${targetPath || "/"}`;
}
