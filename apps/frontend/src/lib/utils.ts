import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Ensure NEXT_PUBLIC_BASE_URL is set - remove fallback to old deployed link
if (!process.env.NEXT_PUBLIC_BASE_URL) {
  console.warn(
    'NEXT_PUBLIC_BASE_URL environment variable is not set. '
    + 'Please set this in your .env.local file to the current backend URL.'
  );
}

export const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
