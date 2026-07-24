import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const simulationDir = dirname(fileURLToPath(import.meta.url))

function collectTsFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      out.push(...collectTsFiles(full))
      continue
    }
    if (name.endsWith('.ts')) out.push(full)
  }
  return out
}

describe('simulation core isolation', () => {
  it('does not import React', () => {
    for (const file of collectTsFiles(simulationDir)) {
      const source = readFileSync(file, 'utf8')
      expect(source, file).not.toMatch(/from ['"]react['"]/)
      expect(source, file).not.toMatch(/from ['"]react\//)
    }
  })
})
