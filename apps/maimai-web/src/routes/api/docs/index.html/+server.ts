import { text } from "@sveltejs/kit";

import { SCALAR_HTML } from "@repo/core";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = ({ setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, max-age=3600",
    "Content-Type": "text/html; charset=utf-8",
  });

  return text(SCALAR_HTML);
};
