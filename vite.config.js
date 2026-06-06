import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const META_PATH = fileURLToPath(new URL('./src/utils/photoMeta.json', import.meta.url))

// Dev-only persistence for the /annotate tool. GET returns the current
// photoMeta.json; POST { src, meta } merges one photo's metadata into the
// file (empty fields are dropped; an all-empty meta deletes the entry).
// Keys are kept sorted so diffs stay reviewable.
const photoMetaEditor = () => ({
  name: 'photo-meta-editor',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__photo-meta', (req, res) => {
      res.setHeader('Content-Type', 'application/json')

      if (req.method === 'GET') {
        res.end(fs.readFileSync(META_PATH, 'utf8'))
        return
      }

      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end(JSON.stringify({ ok: false, error: 'method not allowed' }))
        return
      }

      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        try {
          const { src, meta } = JSON.parse(body)
          if (!src || typeof src !== 'string') throw new Error('missing src')

          const cleaned = {}
          for (const [key, value] of Object.entries(meta || {})) {
            if (Array.isArray(value)) {
              const items = value.map((v) => String(v).trim()).filter(Boolean)
              if (items.length) cleaned[key] = items
            } else if (typeof value === 'string' && value.trim()) {
              cleaned[key] = value.trim()
            }
          }

          const all = JSON.parse(fs.readFileSync(META_PATH, 'utf8'))
          if (Object.keys(cleaned).length) {
            all[src] = cleaned
          } else {
            delete all[src]
          }
          const sorted = Object.fromEntries(
            Object.keys(all).sort().map((key) => [key, all[key]])
          )
          fs.writeFileSync(META_PATH, `${JSON.stringify(sorted, null, 4)}\n`)
          res.end(JSON.stringify({ ok: true, annotated: Object.keys(sorted).length }))
        } catch (error) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: String(error.message || error) }))
        }
      })
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), photoMetaEditor()],
  server: {
    watch: {
      // Saves from /annotate write photoMeta.json continuously — don't let
      // each save trigger a full-page HMR reload of the annotation session.
      // Photo pages pick up new text on the next manual reload / dev restart.
      ignored: ['**/src/utils/photoMeta.json'],
    },
  },
})
