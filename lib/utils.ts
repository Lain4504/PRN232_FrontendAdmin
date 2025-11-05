import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_APP_URL environment variable if available,
 * otherwise falls back to window.location.origin (client-side) or
 * process.env.VERCEL_URL (server-side)
 */
export function getBaseUrl(): string {
  // Priority 1: Use environment variable if available (for production)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Priority 2: If running in browser (client-side), use window.location.origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  
  // Priority 3: If running on Vercel, use VERCEL_URL
  if (typeof process !== 'undefined' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Priority 4: Fallback to localhost (for local development only)
  return 'http://localhost:3000'
}