import { env } from "$env/dynamic/private";
import { imageProxyQuerySchema } from "$lib/api/schemas";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const parseResult = imageProxyQuerySchema.safeParse({
    img: url.searchParams.get("img"),
  });

  if (!parseResult.success) {
    return new Response("Bad Request", { status: 400 });
  }

  const { img } = parseResult.data;

  const res = await fetch(`${env.MUSIC_IMAGE_URL}/${img}`);
  if (!res.ok) {
    return new Response("Getting image failed", { status: res.status });
  }

  const contentType = res.headers.get("Content-Type");
  if (!contentType || !contentType.startsWith("image/")) {
    return new Response("Not an image", { status: 400 });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=604800",
    },
  });
};
