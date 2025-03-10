import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import * as TJS from 'typescript-json-schema'

export interface SchemaConfig {
  basePath: string // Output directory for schemas
  tsconfigPath?: string // Path to tsconfig.json
  minify?: boolean // Whether to minify the output (default: false)
}

export interface SchemaTypeConfig {
  typeName: string // Type name
  outputFile: string // Output filename (without path)
}

export class SchemaGenerator {
  private config: SchemaConfig
  private program: TJS.Program

  constructor(config: SchemaConfig) {
    this.config = {
      ...config,
      tsconfigPath: config.tsconfigPath ?? join(process.cwd(), 'tsconfig.json'),
      minify: config.minify ?? false,
    }

    // Initialize the program once during construction
    this.program = TJS.programFromConfig(this.config.tsconfigPath!)
  }

  /**
   * Generate a schema for a single type
   * @param typeName The name of the TypeScript type to generate schema for
   * @param outputFile The output filename (without path)
   * @returns The relative file path that was written
   */
  generateSchema(typeName: string, outputFile: string): string {
    const schema = TJS.generateSchema(this.program, typeName, {
      required: true,
      noExtraProps: true,
      strictNullChecks: true,
    })

    if (!schema) {
      throw new Error(`Failed to generate schema for ${typeName}`)
    }

    const filePath = join(process.cwd(), this.config.basePath, outputFile)
    // Create relative path for reporting, e.g. "schema/credit-card.json"
    const relativePath = join(this.config.basePath, outputFile)

    // Ensure the directory exists
    const dir = dirname(filePath)
    mkdirSync(dir, { recursive: true })

    // Write the schema to a file
    const jsonString = JSON.stringify(schema, null, this.config.minify ? 0 : 2)
    writeFileSync(filePath, jsonString)

    console.log(`Exported schema for ${typeName} to ${relativePath}`)
    return relativePath
  }

  /**
   * Generate schemas for multiple types
   * @param types Array of type configurations
   * @returns Array of relative file paths that were written
   */
  generateSchemas(types: SchemaTypeConfig[]): string[] {
    const filePaths: string[] = []

    for (const type of types) {
      const filePath = this.generateSchema(type.typeName, type.outputFile)
      filePaths.push(filePath)
    }

    console.log(`Generated ${types.length} schemas`)
    return filePaths
  }

  /**
   * Update the "yaml.schemas" mapping in .vscode/settings.json based on the given types.
   * For each SchemaTypeConfig, the key will be "./<basePath>/<outputFile>" and the value
   * will be a pattern like "raw/<outputFileWithoutExtension>/*".
   * Other existing settings are preserved.
   * @param types Array of SchemaTypeConfig for which to build the mapping
   */
  updateVscodeSettings(types: SchemaTypeConfig[]): void {
    const vscodeSettingsPath = join(process.cwd(), '.vscode', 'settings.json')
    let settings: any = {}
    try {
      const fileContent = readFileSync(vscodeSettingsPath, 'utf8')
      settings = JSON.parse(fileContent)
    } catch {
      console.log(`Could not read .vscode/settings.json, it will be created.`)
    }

    // Preserve existing mappings from yaml.schemas
    const currentMapping = settings['yaml.schemas'] || {}

    types.forEach((typeConfig) => {
      // Create key as "./schema/<outputFile>" using the configured basePath d
      const schemaKey = join('.', this.config.basePath, typeConfig.outputFile).replace(/\\/g, '/')
      // Assume the matching YAML files are under "raw/${folderName}/*"
      const folderName = typeConfig.outputFile.replace(/\.[^/.]+$/, '')
      const globPattern = `raw/${folderName}/*`
      currentMapping[schemaKey] = globPattern
    })

    settings['yaml.schemas'] = currentMapping
    writeFileSync(vscodeSettingsPath, JSON.stringify(settings, null, 4))
    console.log(`Updated ${types.length} schema mappings`)
  }
}
