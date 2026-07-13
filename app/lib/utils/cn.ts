import { clsx, type ClassValue } from "clsx";

/** Merge class names (Tailwind-friendly). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
