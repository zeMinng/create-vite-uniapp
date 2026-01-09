/**
 * Validates if a string is a valid package name.
 * Supports lowercase letters, digits, dots, underscores, and hyphens.
 * * @param name - The package name to validate.
 * @returns True if the name is valid, false otherwise.
 */
export function isValidPackageName(name: string): boolean {
  return /^[a-z0-9._-]+$/.test(name)
}

/**
 * Normalizes the target directory path by removing leading/trailing whitespace 
 * and stripping trailing slashes.
 * * @param targetDir - The raw directory path string.
 * @returns The formatted directory path.
 */
export function formatTargetDir(targetDir: string): string {
  return targetDir.trim().replace(/\/+$/g, '')
}
