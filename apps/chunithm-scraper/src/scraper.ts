import { Page } from "playwright";

import { mobileBaseURL } from "./constants.js";

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
    { fetchPath: `${mobileBaseURL}${path}`, method, headers, body },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${path}: ${response.status} ${response.statusText}, content: ${response.text}`,
    );
  }

  return response.text;
}
