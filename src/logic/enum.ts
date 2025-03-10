export function toEnum<T>(enumObj: T, value: string): T[keyof T]
export function toEnum<T>(enumObj: T, value: string | undefined): T[keyof T] | undefined

/**
 * Generic function to convert string to enum value
 * Assumes the enum key is the same as the string (case-insensitive)
 *
 * @param enumType The enum type to convert to
 * @param value The string value to convert
 * @returns The enum value
 */
export function toEnum<T>(enumObj: T, value: string | undefined): T[keyof T] | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const normalizedValue = value.toLowerCase()
  // Filter out numeric keys since TypeScript enums generate both string and reverse numeric mappings.
  for (const key in enumObj) {
    if (isNaN(Number(key)) && key.toLowerCase() === normalizedValue) {
      return enumObj[key as keyof T]
    }
  }
  return undefined
}

/**
 * Generic function to convert enum value to string key
 * Returns the enum key as string that corresponds to the provided value
 *
 * @param enumObj The enum object
 * @param value The enum value to convert
 * @returns The string key, or undefined if no matching value found
 */
export function fromEnum<T extends object>(enumObj: T, value: T[keyof T]): string | undefined {
  for (const key in enumObj) {
    if (isNaN(Number(key)) && enumObj[key as keyof T] === value) {
      return key
    }
  }
  return undefined
}

/**
 * Get all keys of an enum
 *
 * @param enumObj The enum object
 * @returns Array of enum keys
 */
export function enumKeys<T extends object>(enumObj: T): Array<keyof T> {
  // Filter out numeric keys since TypeScript enums generate both string and reverse numeric mappings
  return Object.keys(enumObj).filter((key) => isNaN(Number(key))) as Array<keyof T>
}
