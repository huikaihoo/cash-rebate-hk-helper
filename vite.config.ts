import { defineConfig, loadEnv } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { imageToWebpPlugin } from 'vite-plugin-image-to-webp'

import DataPlugin from './src/plugin/data'
import WebpServePlugin from './src/plugin/image'
import PublicFileList from './src/plugin/list'

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '')

  const basePath = env.VITE_BASE_URL || '/'

  return {
    base: basePath,
    server: {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      port: 8009,
    },
    preview: {
      port: 8009,
    },
    plugins: [
      DataPlugin(),
      PublicFileList({
        include: /^(\/data\/.*\.json|\/images\/.*)$/,
        exclude: /\/(\.DS_Store|Thumbs\.db)$/,
        transform: (path) => path.replace(/\.(png|jpg|jpeg)$/i, '.webp'),
      }),
      WebpServePlugin(),
      imageToWebpPlugin({
        imageFormats: ['jpg', 'jpeg', 'png'],
        webpQuality: {
          quality: 95,
        },
        destinationFolder: 'dist',
      }),
      ViteImageOptimizer({
        webp: {
          quality: 95,
        },
        include: /\.webp$/i, // Exclude SVGs explicitly
        logStats: true, // Show optimization stats in terminal
      }),
    ],
  }
})
