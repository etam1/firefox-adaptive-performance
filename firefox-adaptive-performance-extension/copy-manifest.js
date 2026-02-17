import { copyFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const distDir = join(process.cwd(), 'dist')
const contentScriptsDir = join(process.cwd(), 'src', 'content-scripts')
const distContentScriptsDir = join(distDir, 'content-scripts')

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

// Ensure content-scripts directory exists in dist
if (!existsSync(distContentScriptsDir)) {
  mkdirSync(distContentScriptsDir, { recursive: true })
}

// Copy manifest.json
copyFileSync('manifest.json', join(distDir, 'manifest.json'))
console.log('✓ Copied manifest.json to dist/')

// Copy content scripts
if (existsSync(contentScriptsDir)) {
  const files = readdirSync(contentScriptsDir)
  files.forEach(file => {
    const srcPath = join(contentScriptsDir, file)
    const distPath = join(distContentScriptsDir, file)
    const stat = statSync(srcPath)
    if (stat.isFile() && file.endsWith('.js')) {
      copyFileSync(srcPath, distPath)
      console.log(`✓ Copied content script: ${file}`)
    }
  })
} else {
  console.log('⚠ Content scripts directory not found')
}

// Create simple placeholder icons (SVG as data URI, but Firefox needs actual files)
// For now, we'll create a simple note that icons are optional
console.log('⚠ Note: Add icon-48.png and icon-96.png to dist/ for icons (optional)')

