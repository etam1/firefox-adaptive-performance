import { copyFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const distDir = join(process.cwd(), 'dist')

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

// Copy manifest.json
copyFileSync('manifest.json', join(distDir, 'manifest.json'))

// Create simple placeholder icons (SVG as data URI, but Firefox needs actual files)
// For now, we'll create a simple note that icons are optional
console.log('✓ Copied manifest.json to dist/')
console.log('⚠ Note: Add icon-48.png and icon-96.png to dist/ for icons (optional)')

