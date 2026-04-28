import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with `clsx` and resolve Tailwind class conflicts via
 * `tailwind-merge`. Use as the canonical helper for joining classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
