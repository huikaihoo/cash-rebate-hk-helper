import type { DisplayText } from '@/logic/locales'

export type RawOptionsRecords = { [key: string]: DisplayText | string }

export interface RawOptions {
  name: string
  sortBy: 'key' | 'value' | 'default'
  content: RawOptionsRecords | { [group: string]: RawOptionsRecords }[]
}
