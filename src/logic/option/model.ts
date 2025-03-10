export type OptionsRecord =
  | string // key only
  | [string, string[]] // key and list of groups
  | [string, string] // key and value
  | [string, string, string[]] // key, value, and list of groups

export type Options = { [name: string]: OptionsRecord[] }
