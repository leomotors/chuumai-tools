async function ensureImageLoaded(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      if (img.complete) {
        return Promise.resolve(); // Already loaded
      }
      return new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error(`Failed to load image: ${img.src}`));
      });
    }),
  );

  await document.fonts.ready; // Ensure all fonts are loaded
}

export async function handleDownload(
  elementId: string,
  toPng: (element: HTMLElement) => Promise<string>,
  isDebug: boolean,
) {
  const element = document.getElementById(elementId)!;

  element.style.display = "flex";
  await ensureImageLoaded(element);
  const dataUrl = await toPng(element);

  if (!isDebug) {
    element.style.display = "none";

    // Download
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = dataUrl;
    link.click();
  }
}
