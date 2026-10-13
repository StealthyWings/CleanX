import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const relativeFormatters: Record<string, Intl.RelativeTimeFormat> = {};

export function timeAgo(timestamp: number, locale = "en"): string {
  const rtf = (relativeFormatters[locale] ??= new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: "short",
  }));
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return rtf.format(-seconds, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  return rtf.format(-days, "day");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Fast fingerprint for image data URLs.
 * Samples every 100th character of the base64 payload for O(n/100) performance.
 * Collisions are possible but extremely unlikely for distinct real photos.
 */
export function hashImageData(dataUrl: string): string {
  let hash = 5381;
  const step = 100;
  for (let i = 0; i < dataUrl.length; i += step) {
    hash = ((hash << 5) + hash + dataUrl.charCodeAt(i)) & 0xffffffff;
  }
  // Also include the total length to differentiate similar-prefix images
  hash = ((hash << 5) + hash + dataUrl.length) & 0xffffffff;
  return hash.toString(36);
}

/**
 * Downscales a photo in the browser before upload (longest side ≤ maxSize, JPEG).
 * Keeps uploads small for the database; falls back to the original on any failure.
 */
export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<string> {
  const original = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  try {
    const img = new Image();
    img.src = original;
    await img.decode();
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL("image/jpeg", quality);
    return compressed.length < original.length ? compressed : original;
  } catch {
    return original;
  }
}
