import { readdirSync, statSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { Plugin } from 'vite'

interface PublicFileListOptions {
  include?: RegExp // Only include paths matching this regex
  exclude?: RegExp // Exclude paths matching this regex
  transform?: (path: string) => string // Function to transform file names
}

function getPublicFiles(dir: string, baseDir: string, options: PublicFileListOptions = {}): string[] {
  const files: string[] = []
  const items = readdirSync(dir)
  const { include, exclude, transform } = options

  for (const item of items) {
    const fullPath = resolve(dir, item)
    const stat = statSync(fullPath)

    if (stat.isFile()) {
      // Get full relative path from the public directory root
      let relativePath = fullPath.replace(baseDir, '').replace(/\\/g, '/').replace(/^\/?/, '/')

      // Apply transform if provided
      if (transform) {
        relativePath = transform(relativePath)
      }

      // Include only if matches include regex (or no include regex provided)
      // and doesn't match exclude regex (or no exclude regex provided)
      const shouldInclude = !include || include.test(relativePath)
      const shouldExclude = exclude && exclude.test(relativePath)

      if (shouldInclude && !shouldExclude) {
        files.push(relativePath)
      }
    } else if (stat.isDirectory()) {
      files.push(...getPublicFiles(fullPath, baseDir, options))
    }
  }

  if (baseDir === dir) {
    files.sort()
  }
  return files
}

export default function PublicFileList(options: PublicFileListOptions = {}): Plugin {
  const publicDir = resolve(process.cwd(), 'public')
  let isBuildMode = false

  return {
    name: 'vite-plugin-public-file-list',
    config(_, { command }) {
      isBuildMode = command === 'build'
    },
    configureServer(server) {
      server.middlewares.use('/list.json', (_, res) => {
        try {
          const files = getPublicFiles(publicDir, publicDir, options)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(files, null, 2))
        } catch (error) {
          console.error('Error generating file list:', error)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to generate file list' }))
        }
      })
    },
    buildStart() {
      if (isBuildMode) {
        try {
          const files = getPublicFiles(publicDir, publicDir, options)
          const outputPath = resolve(process.cwd(), 'public/list.json')
          writeFileSync(outputPath, JSON.stringify(files, null, 2))
        } catch (error) {
          console.error('Error generating file list:', error)
        }
      }
    },
  }
}
