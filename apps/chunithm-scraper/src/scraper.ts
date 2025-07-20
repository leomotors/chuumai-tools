import { Page } from "playwright";

const baseURL = "https://chunithm-net-eng.com/mobile/";

export async function fetchPath(
  page: Page,
  path: string,
  method = "GET",
  headers?: Record<string, string>,
  body?: RequestInit["body"],
) {
  const response = await page.evaluate(
    async ({ fetchPath, method, headers, body }) => {
      const response = await fetch(fetchPath, {
        method,
        headers,
        body,
      });
      const text = await response.text();

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        text,
      };
    },
    { fetchPath: `${baseURL}${path}`, method, headers, body },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${path}: ${response.status} ${response.statusText}, content: ${response.text}`,
    );
  }

  return response.text;
}
