import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge to handle conflicts
 *
 * @param {...(string|Object|Array)} inputs - Class names, objects, or arrays to merge
 * @returns {string} Merged class string
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary', 'px-6') // px-6 overrides px-4
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
