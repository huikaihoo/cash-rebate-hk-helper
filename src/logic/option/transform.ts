import _ from 'lodash'

import { cleanLocales, DisplayText, Locales, LocalesRecord } from '@/logic/locales'
import type { Options, OptionsRecord } from '@/logic/option/model'
import type { RawOptions } from '@/logic/option/raw'

function extractCompareReference(value: OptionsRecord, sortBy: 'key' | 'value'): string {
  const index = sortBy === 'key' ? 0 : 1
  return Array.isArray(value) ? (Array.isArray(value[index]) ? value[0] : value[index]) : value
}

function updateOptionsLocales(locales: Locales, optionName: string, key: string, value: DisplayText): void {
  ;(locales.en[optionName] as LocalesRecord)[key] = value.en
  ;(locales.zh[optionName] as LocalesRecord)[key] = value.zh
}

/**
 * Transforms raw options into a structured format.
 *
 * @param raw - The raw options to transform.
 * @returns The transformed options.
 */
export function transformOptions(rawOptions: RawOptions[]): {
  options: Options
  optionsLocales: Locales
} {
  const options: Options = {}
  const locales: Locales = { en: {}, zh: {} }

  rawOptions.forEach((rawOption) => {
    const optionName = rawOption.name

    options[optionName] = []
    locales.en[optionName] = {} as LocalesRecord
    locales.zh[optionName] = {} as LocalesRecord

    if (Array.isArray(rawOption.content)) {
      const recordMap = new Map<string, OptionsRecord>()

      rawOption.content.forEach((groupObj) => {
        Object.entries(groupObj).forEach(([groupName, groupContent]) => {
          Object.entries(groupContent).forEach(([key, value]) => {
            if (typeof value === 'string') {
              const entry: OptionsRecord = [key, value, [groupName]]
              if (!recordMap.has(key)) {
                recordMap.set(key, entry)
              } else {
                const existing = recordMap.get(key) as [string, string, string[]]
                existing[2] = _.union(existing[2], [groupName]) // Deduplicate groups
              }
            } else {
              const entry: OptionsRecord = [key, [groupName]]
              if (!recordMap.has(key)) {
                recordMap.set(key, entry)
              } else {
                const existing = recordMap.get(key) as [string, string[]]
                existing[1] = _.union(existing[1], [groupName]) // Deduplicate groups
              }
              updateOptionsLocales(locales, optionName, key, value)
            }
          })
        })
      })

      // Convert Map values to array
      options[optionName].push(...recordMap.values())
    } else {
      // Handle simple record format
      Object.entries(rawOption.content).forEach(([key, value]) => {
        if (typeof value === 'string') {
          options[optionName].push([key, value])
        } else {
          options[optionName].push(key)
          updateOptionsLocales(locales, optionName, key, value)
        }
      })
    }

    // Sort the options based on the sortBy field
    const sortBy = rawOption.sortBy
    if (sortBy !== 'default') {
      options[optionName].sort((a, b) => {
        const refA = extractCompareReference(a, sortBy)
        const refB = extractCompareReference(b, sortBy)
        return refA.localeCompare(refB)
      })
    }
  })

  return { options, optionsLocales: cleanLocales(locales) }
}
