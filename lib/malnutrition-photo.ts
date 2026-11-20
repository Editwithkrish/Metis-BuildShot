export function photoDataUrl(source: CanvasImageSource, width: number, height: number) {
  if (!width || !height) throw new Error("The image does not have a readable frame.");
  const scale = Math.min(1, 1280 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("This browser could not prepare the photo.");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export async function preparePhoto(file: File) {
  if (file.size > 25 * 1024 * 1024) throw new Error("Choose an image under 25 MB.");
  if (file.type && !file.type.startsWith("image/")) throw new Error("Choose an image file.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return photoDataUrl(image, image.naturalWidth, image.naturalHeight);
  } catch {
    throw new Error("This image couldn’t be opened. Try a JPEG, PNG, or WebP.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
