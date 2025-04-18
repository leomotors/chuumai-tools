import { environment } from "$lib/environment.js";

import type { RequestHandler } from "./$types.js";

export const GET: RequestHandler = async ({ url }) => {
  const img = url.searchParams.get("img");
  if (
    !img ||
    typeof img !== "string" ||
    !/^[a-zA-Z0-9]+\.(jpg|png)$/.test(img)
  ) {
    return new Response("Bad Request", { status: 400 });
  }

  const res = await fetch(`${environment.MUSIC_IMAGE_URL}/${img}`);
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
      "Cache-Control": "public, max-age=31536000",
    },
  });
};
