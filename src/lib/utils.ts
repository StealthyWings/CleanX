import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
