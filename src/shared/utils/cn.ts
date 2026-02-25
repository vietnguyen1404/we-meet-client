/**
 * Utility function to merge CSS class names
 * Simple implementation - install clsx and tailwind-merge for better class merging
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
