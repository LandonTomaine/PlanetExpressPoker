#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const themeId = process.argv[2]
const allowUnreferenced = process.argv.includes('--allow-unreferenced')

if (!themeId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(themeId)) {
  console.error(
    'Usage: node audit-theme-assets.mjs <theme-id> [--allow-unreferenced]'
  )
  process.exit(2)
}

const repoRoot = process.cwd()
const registryPath = path.join(
  repoRoot,
  'src',
  'features',
  'theme',
  'registry.ts'
)
const publicRoot = path.join(repoRoot, 'public')
const themeRoot = path.join(publicRoot, 'themes', themeId)
const registry = await fs.readFile(registryPath, 'utf8')
const escapedThemeId = themeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const assetPattern = new RegExp(
  `['"\`](/themes/${escapedThemeId}/[^'"\`\\s]+)['"\`]`,
  'g'
)
const referencedPaths = new Set(
  Array.from(registry.matchAll(assetPattern), (match) => match[1])
)
const errors = []
const warnings = []
const animatedGifs = []

if (referencedPaths.size === 0) {
  errors.push(`No /themes/${themeId}/ asset references found in registry.ts`)
}

const files = await walk(themeRoot).catch((error) => {
  errors.push(`Cannot read ${relative(themeRoot)}: ${error.message}`)
  return []
})
const publicPaths = new Set(
  files.map((filePath) => `/${relative(filePath).replace(/^public\//, '')}`)
)

for (const assetPath of referencedPaths) {
  if (!publicPaths.has(assetPath)) {
    errors.push(`Missing referenced asset: ${assetPath}`)
  }
}

for (const assetPath of publicPaths) {
  if (!referencedPaths.has(assetPath)) {
    const message = `Unreferenced public asset: ${assetPath}`
    if (allowUnreferenced) {
      warnings.push(message)
    } else {
      errors.push(message)
    }
  }
}

for (const filePath of files) {
  const extension = path.extname(filePath).toLowerCase()
  const contents = await fs.readFile(filePath)

  if (contents.byteLength > 5 * 1024 * 1024) {
    warnings.push(
      `${relative(filePath)} is ${(contents.byteLength / 1024 / 1024).toFixed(1)} MB`
    )
  }

  if (extension === '.gif') {
    const frameCount = countGifFrames(contents)
    animatedGifs.push(`${relative(filePath)} (${frameCount} frames)`)
    if (frameCount < 2) {
      errors.push(
        `GIF is not animated: ${relative(filePath)} (${frameCount} frame)`
      )
    }
  }

  if (extension === '.svg') {
    const svg = contents.toString('utf8')
    const unsafePattern =
      /<script\b|\son[a-z]+\s*=|\b(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|javascript:|data:text\/html)|url\(\s*["']?\s*https?:/i
    if (unsafePattern.test(svg)) {
      errors.push(
        `SVG contains active or external content: ${relative(filePath)}`
      )
    }
  }
}

console.log(
  `Theme ${themeId}: ${referencedPaths.size} references, ${files.length} files`
)
for (const gif of animatedGifs) {
  console.log(`Animated GIF: ${gif}`)
}
for (const warning of warnings) {
  console.warn(`Warning: ${warning}`)
}
for (const error of errors) {
  console.error(`Error: ${error}`)
}

if (errors.length > 0) {
  process.exit(1)
}

console.log('Theme asset audit passed.')

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)
      return entry.isDirectory() ? walk(entryPath) : [entryPath]
    })
  )
  return nested.flat().sort()
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/')
}

function countGifFrames(buffer) {
  if (!['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) {
    return 0
  }

  if (buffer.length < 13) {
    return 0
  }

  const packedFields = buffer[10]
  let offset = 13
  if ((packedFields & 0x80) !== 0) {
    offset += 3 * 2 ** ((packedFields & 0x07) + 1)
  }

  let frames = 0
  while (offset < buffer.length) {
    const marker = buffer[offset++]

    if (marker === 0x3b) {
      break
    }

    if (marker === 0x21) {
      offset += 1
      offset = skipSubBlocks(buffer, offset)
      continue
    }

    if (marker !== 0x2c || offset + 9 > buffer.length) {
      return 0
    }

    frames += 1
    const imagePackedFields = buffer[offset + 8]
    offset += 9
    if ((imagePackedFields & 0x80) !== 0) {
      offset += 3 * 2 ** ((imagePackedFields & 0x07) + 1)
    }

    offset += 1
    offset = skipSubBlocks(buffer, offset)
  }

  return frames
}

function skipSubBlocks(buffer, startOffset) {
  let offset = startOffset
  while (offset < buffer.length) {
    const blockSize = buffer[offset++]
    if (blockSize === 0) {
      return offset
    }
    offset += blockSize
  }
  return offset
}
