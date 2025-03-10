import { readFileSync, readdirSync } from 'fs'
import { join, basename } from 'path'
import { parse as parseYaml } from 'yaml'

export interface ImportConfig {
  basePath: string
  fileFormat?: 'yaml' | 'json'
}

export class Importer {
  private config: ImportConfig

  constructor(config: ImportConfig) {
    this.config = {
      ...config,
      fileFormat: config.fileFormat ?? 'yaml',
    }
  }

  private getFileExtension(): string {
    return '.' + this.config.fileFormat
  }

  /**
   * Import a single file and parse it
   * @param filename The name of the file (without path)
   * @returns The parsed object
   */
  importObject<T>(folder: string, filename: string): T {
    const filePath = join(process.cwd(), this.config.basePath, folder, filename)
    const fileContent = readFileSync(filePath, 'utf8')

    if (this.config.fileFormat === 'yaml') {
      return parseYaml(fileContent) as T
    } else if (this.config.fileFormat === 'json') {
      return JSON.parse(fileContent) as T
    } else {
      throw new Error(`Unsupported file type: ${this.config.fileFormat}`)
    }
  }

  /**
   * Import all files from the data directory
   * @returns Array of parsed objects
   */
  importList<T>(folder: string): T[] {
    const dirPath = join(process.cwd(), this.config.basePath, folder)
    const files = readdirSync(dirPath).filter((file) => file.endsWith(this.getFileExtension()))

    const list = files.map((file) => {
      return this.importObject<T>(folder, file)
    })

    console.log(`Imported ${files.length} files: ${this.config.basePath}/${folder}`)
    return list
  }

  /**
   * Import all files and index them by name
   * @returns Object mapping names to parsed objects
   */
  importMap<T>(folder: string): Record<string, T> {
    const dirPath = join(process.cwd(), this.config.basePath, folder)
    const files = readdirSync(dirPath).filter((file) => file.endsWith(this.getFileExtension()))
    const itemMap: Record<string, T> = {}

    for (const file of files) {
      const item = this.importObject<T>(folder, file)
      // Use the file name without extension as the key
      const key = basename(file, this.getFileExtension())
      itemMap[key] = item
    }

    console.log(`Imported ${files.length} files: ${this.config.basePath}/${folder}`)
    return itemMap
  }
}
