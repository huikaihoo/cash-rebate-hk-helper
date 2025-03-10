import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import type { Plugin } from 'vite'

interface WebpServeOptions {
  webp?: sharp.WebpOptions
  include?: string[]
  exclude?: string[]
  cache?: boolean
}

async function isFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export default function WebpServePlugin(options: WebpServeOptions = {}): Plugin {
  const { webp = { quality: 80, effort: 2 }, include = ['jpg', 'jpeg', 'png'], exclude = [], cache = true } = options

  const cacheStore = new Map<string, Buffer>()

  return {
    name: 'vite-plugin-webp-serve',
    configureServer(server) {
      server.middlewares.use(server.config.base, async (req, res, next) => {
        const url = req.url ?? ''
        const ext = url.split('.').pop()?.toLowerCase()
        if (!ext || ext !== 'webp' || exclude.some((path) => url.includes(path))) {
          return next()
        }

        try {
          let filePath: string
          let sourceFilePath: string | undefined

          // Check for existing webp file first
          const webpFilePath = path.join('./public', url)
          if (await isFileExists(webpFilePath)) {
            return next() // File exists, let Vite handle it
          }

          // Handle .webp requests by looking for source file
          const basePath = url.replace('.webp', '')
          for (const supportedExt of include) {
            filePath = path.join('./public', `${basePath}.${supportedExt}`)
            if (await isFileExists(filePath)) {
              sourceFilePath = filePath
              break
            }
          }

          if (!sourceFilePath) {
            return next()
          }

          res.setHeader('Content-Type', 'image/webp')
          res.setHeader('Cache-Control', 'public, max-age=31536000')

          // Check cache
          const cacheKey = cache ? url : null
          if (cache && cacheKey && cacheStore.has(cacheKey)) {
            const cached = cacheStore.get(cacheKey)!
            res.setHeader('X-Cache', 'HIT')
            return res.end(cached)
          }

          // Convert to webp
          const imageBuffer = await fs.readFile(sourceFilePath)
          const webpBuffer = await sharp(imageBuffer).webp(webp).toBuffer()
          if (cache && cacheKey) {
            cacheStore.set(cacheKey, webpBuffer)
          }

          res.setHeader('X-Cache', 'MISS')
          res.end(webpBuffer)
        } catch (error) {
          console.error('webp handling error:', error)
          next()
        }
      })
    },
    closeBundle() {
      cacheStore.clear()
    },
  }
}
