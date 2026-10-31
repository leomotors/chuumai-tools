import { describe, expect, test } from "vitest";

import {
  parseRatingBreakdownImageUploadRequest,
  ratingBreakdownImageResponseHeaders,
} from "./jobUpload.js";

const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

function uploadRequest(image: Blob) {
  const formData = new FormData();
  formData.set("jobId", "42");
  formData.set("image", image, "breakdown.png");

  return new Request("http://localhost/api/jobs/ratingBreakdownImage", {
    method: "POST",
    body: formData,
  });
}

describe("parseRatingBreakdownImageUploadRequest", () => {
  test("accepts a PNG upload", async () => {
    const upload = await parseRatingBreakdownImageUploadRequest(
      uploadRequest(new Blob([PNG_BYTES], { type: "image/png" })),
    );

    expect(upload).toMatchObject({
      jobId: 42,
      mimeType: "image/png",
      byteSize: PNG_BYTES.byteLength,
    });
  });

  test("rejects an SVG upload", async () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>';

    await expect(
      parseRatingBreakdownImageUploadRequest(
        uploadRequest(new Blob([svg], { type: "image/svg+xml" })),
      ),
    ).rejects.toThrow("image must be a PNG file");
  });

  test("rejects non-PNG bytes declared as image/png", async () => {
    await expect(
      parseRatingBreakdownImageUploadRequest(
        uploadRequest(
          new Blob(["<html><script>1</script></html>"], { type: "image/png" }),
        ),
      ),
    ).rejects.toThrow("image must be a PNG file");
  });
});

describe("ratingBreakdownImageResponseHeaders", () => {
  test("always serves as a non-sniffable, sandboxed PNG", () => {
    const headers = ratingBreakdownImageResponseHeaders(123);

    expect(headers.get("Content-Type")).toBe("image/png");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Content-Security-Policy")).toBe(
      "default-src 'none'; sandbox",
    );
    expect(headers.get("Content-Length")).toBe("123");
  });

  test("omits Content-Length when unknown", () => {
    expect(
      ratingBreakdownImageResponseHeaders(null).has("Content-Length"),
    ).toBe(false);
  });
});
