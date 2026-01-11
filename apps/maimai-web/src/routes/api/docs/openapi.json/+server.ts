import { json } from "@sveltejs/kit";

import { generateOpenApiDocument } from "$lib/api/openapi";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  return json(generateOpenApiDocument(WEB_VERSION));
};
