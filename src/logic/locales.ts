export interface DisplayText {
  zh: string
  en: string
}

export type LocalesRecord = {
  [key: string]: string | LocalesRecord
}

export interface Locales {
  en: LocalesRecord
  zh: LocalesRecord
}
/**
 * Recursively remove keys that have empty object values
 * @param localesRecord The record to clean
 * @returns Cleaned record with empty objects removed
 */
export function cleanLocalesRecord(localesRecord: LocalesRecord): LocalesRecord {
  const keysToDelete: string[] = []

  for (const [key, value] of Object.entries(localesRecord)) {
    if (typeof value === 'object' && value !== null) {
      cleanLocalesRecord(value)
      if (Object.keys(value).length === 0) {
        keysToDelete.push(key)
      }
    }
  }

  keysToDelete.forEach((key) => {
    delete localesRecord[key]
  })

  return localesRecord
}

/**
 * Clean both language records in a Locales object
 * @param locales The locales to clean
 * @returns Cleaned locales with empty objects removed
 */
export function cleanLocales(locales: Locales): Locales {
  return {
    en: cleanLocalesRecord(locales.en),
    zh: cleanLocalesRecord(locales.zh),
  }
}
