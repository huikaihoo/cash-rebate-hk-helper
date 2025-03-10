import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

export interface ExportConfig {
  basePath: string
  minify?: boolean // Whether to minify the output (default: true)
}

export class Exporter {
  private config: ExportConfig

  constructor(config: ExportConfig) {
    this.config = {
      ...config,
      minify: config.minify ?? true,
    }
  }

  /**
   * Export a single object to a JSON file
   * @param data The data to export
   * @param filename The name of the file (without path and extension)
   * @returns The full file path that was written
   */
  exportObject(data: any[] | Record<string, any>, filename: string): string {
    const length = Array.isArray(data) ? data.length : Object.keys(data).length
    const filePath = join(process.cwd(), this.config.basePath, `${filename}.json`)

    // Always create directory if it doesn't exist
    mkdirSync(dirname(filePath), { recursive: true })

    const jsonString = JSON.stringify(data, null, this.config.minify ? 0 : 2)
    writeFileSync(filePath, jsonString)

    console.log(`Exported ${length} items: ${join(this.config.basePath, `${filename}.json`)}`)
    return filePath
  }

  /**
   * Export multiple objects to separate JSON files
   * @param dataMap A record mapping filenames to data objects
   * @returns Array of file paths that were written
   */
  exportMap(dataMap: Record<string, any>): string[] {
    const filePaths: string[] = []

    for (const [key, data] of Object.entries(dataMap)) {
      const filePath = this.exportObject(data, key)
      filePaths.push(filePath)
    }

    return filePaths
  }

  /**
   * Export an array of objects to a single JSON file
   * @param dataArray Array of objects to export
   * @param filename The name of the file (without path and extension)
   * @returns The full file path that was written
   */
  exportArray(dataArray: any[], filename: string): string {
    return this.exportObject(dataArray, filename)
  }
}
