import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const img = url.searchParams.get("img");
  if (!img || !img.endsWith(".png")) {
    return new Response("Bad Request", { status: 400 });
  }

  const res = await fetch(`https://chunithm-net-eng.com/mobile/img/${img}`);
  if (!res.ok) {
    return new Response("Getting image failed", { status: res.status });
  }

  const blob = await res.blob();

  return new Response(blob, {
    headers: {
      "Content-Type": blob.type,
      "Cache-Control": "public, max-age=31536000",
    },
  });
};
