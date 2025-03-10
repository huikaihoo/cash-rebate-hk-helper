import { relative } from 'path'
import { type Plugin } from 'vite'

import { createData } from '@/plugin/data/data'
import { createSchema } from '@/plugin/data/schema'

export default function DataPlugin(): Plugin {
  let isServeMode = true

  return {
    name: 'vite-plugin-data',
    config(_, { command }) {
      isServeMode = command === 'serve'
    },
    buildStart() {
      console.log('[data][buildStart] isServeMode', isServeMode)
      createData()
      if (isServeMode) {
        createSchema()
      }
    },
    handleHotUpdate({ file }: { file: string }) {
      const relativePath = relative(process.cwd(), file)
      if (relativePath.startsWith('src') || relativePath.startsWith('raw')) {
        console.log('[data][handleHotUpdate]', relativePath)
        createData()
        createSchema()
      }
    },
  }
}
