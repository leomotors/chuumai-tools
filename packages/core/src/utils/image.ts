export function base64ImageToBlob(base64: string) {
  // Extract the MIME type from the Base64 string (the part before the comma)
  const mimeTypeMatch = base64.match(/^data:(.+?);base64,/);
  const mimeType = mimeTypeMatch
    ? mimeTypeMatch[1]
    : "application/octet-stream"; // Fallback to a generic MIME type if not found

  // Convert the Base64 string to binary data
  const byteCharacters = atob(base64.split(",")[1]); // Decode base64 data (remove the data URL part)
  const byteArrays = [];

  // Convert byteCharacters to byteArrays
  for (let offset = 0; offset < byteCharacters.length; offset++) {
    const byte = byteCharacters.charCodeAt(offset);
    byteArrays.push(byte);
  }

  // Create a Blob from the byteArrays
  const blob = new Blob([new Uint8Array(byteArrays)], { type: mimeType }); // Change the MIME type as necessary

  return blob;
}

export async function downloadImageAsBase64(url: string) {
  const res = await fetch(url);
  const contentType = res.headers.get("content-type");
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const content = `data:${contentType};base64,${base64}`;

  return content;
}
