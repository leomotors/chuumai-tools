import { text } from "@sveltejs/kit";

import { createScalarHTML } from "@repo/core/web";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = ({ setHeaders }) => {
  setHeaders({
    "Cache-Control": "public, max-age=3600",
    "Content-Type": "text/html; charset=utf-8",
  });

  return text(createScalarHTML("Uni Wonderhoy"));
};
