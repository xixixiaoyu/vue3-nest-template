import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const appRoot = join(__dirname, '..')

const sourceIco = join(appRoot, 'public', 'favicon.ico')
const buildDir = join(appRoot, 'build')
const linuxIconsDir = join(buildDir, 'icons')

function ensureDir(path) {
  mkdirSync(path, { recursive: true })
}

function canReadImage(path) {
  try {
    execFileSync('sips', ['-g', 'pixelWidth', path], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function resolveSourcePng() {
  const candidates = [
    join(appRoot, 'public', 'maskable-icon-512x512.png'),
    join(appRoot, 'public', 'pwa-512x512.png'),
    join(appRoot, 'public', 'apple-touch-icon-180x180.png'),
  ]

  const source = candidates.find((candidate) => existsSync(candidate) && canReadImage(candidate))

  if (!source) {
    throw new Error(`Missing usable icon source, checked: ${candidates.join(', ')}`)
  }

  return source
}

function resizePng(input, output, size) {
  execFileSync(
    'sips',
    ['-s', 'format', 'png', '-z', String(size), String(size), input, '--out', output],
    {
      stdio: 'ignore',
    },
  )
}

function generateMacIcns(sourcePng) {
  if (process.platform !== 'darwin') {
    return
  }

  const iconsetDir = join(buildDir, 'icon.iconset')
  rmSync(iconsetDir, { recursive: true, force: true })
  ensureDir(iconsetDir)

  const sizes = [
    ['icon_16x16.png', 16],
    ['icon_16x16@2x.png', 32],
    ['icon_32x32.png', 32],
    ['icon_32x32@2x.png', 64],
    ['icon_128x128.png', 128],
    ['icon_128x128@2x.png', 256],
    ['icon_256x256.png', 256],
    ['icon_256x256@2x.png', 512],
    ['icon_512x512.png', 512],
    ['icon_512x512@2x.png', 1024],
  ]

  for (const [filename, size] of sizes) {
    resizePng(sourcePng, join(iconsetDir, filename), size)
  }

  execFileSync('iconutil', ['-c', 'icns', iconsetDir, '-o', join(buildDir, 'icon.icns')], {
    stdio: 'ignore',
  })
}

function generateLinuxIcons(sourcePng) {
  ensureDir(linuxIconsDir)

  for (const size of [16, 32, 64, 128, 256, 512]) {
    resizePng(sourcePng, join(linuxIconsDir, `${size}x${size}.png`), size)
  }
}

function main() {
  const sourcePng = resolveSourcePng()

  ensureDir(buildDir)
  cpSync(sourcePng, join(buildDir, 'icon.png'))

  if (existsSync(sourceIco)) {
    cpSync(sourceIco, join(buildDir, 'icon.ico'))
  }

  generateLinuxIcons(sourcePng)
  generateMacIcns(sourcePng)

  console.warn('Electron build assets are ready in apps/frontend/build')
}

main()
