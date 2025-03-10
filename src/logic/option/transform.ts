import _ from 'lodash'

import type { Options, OptionsRecord } from '@/logic/option/model'
import type { RawOptions } from '@/logic/option/raw'

function extractCompareReference(value: OptionsRecord, sortBy: 'key' | 'value'): string {
  const index = sortBy === 'key' ? 0 : 1
  return Array.isArray(value) ? (Array.isArray(value[index]) ? value[0] : value[index]) : value
}

/**
 * Transforms raw options into a structured format.
 *
 * @param raw - The raw options to transform.
 * @returns The transformed options.
 */
export function transformOptions(rawOptions: RawOptions[]): Options {
  const result: Options = {}

  rawOptions.forEach((rawOption) => {
    const optionName = rawOption.name
    result[optionName] = []

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
            }
          })
        })
      })

      // Convert Map values to array
      result[optionName].push(...recordMap.values())
    } else {
      // Handle simple record format
      Object.entries(rawOption.content).forEach(([key, value]) => {
        if (typeof value === 'string') {
          result[optionName].push([key, value])
        } else {
          result[optionName].push(key)
        }
      })
    }

    // Sort the options based on the sortBy field
    const sortBy = rawOption.sortBy
    if (sortBy !== 'default') {
      result[optionName].sort((a, b) => {
        const refA = extractCompareReference(a, sortBy)
        const refB = extractCompareReference(b, sortBy)
        return refA.localeCompare(refB)
      })
    }
  })

  return result
}
