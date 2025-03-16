import { performance } from 'perf_hooks'

import { SchemaGenerator } from '@/logic/schema'

export function createSchema() {
  const startTime = performance.now()

  const schemaGenerator = new SchemaGenerator({
    basePath: 'schema',
  })

  const types = [
    {
      typeName: 'RawCard',
      outputFile: 'card.json',
    },
    {
      typeName: 'RawOptions',
      outputFile: 'options.json',
    },
  ]

  // Generate schemas for multiple types
  schemaGenerator.generateSchemas(types)
  schemaGenerator.updateVscodeSettings(types)

  const endTime = performance.now()
  console.log(`Schemas generated in ${Math.round(endTime - startTime)}ms`)
}
