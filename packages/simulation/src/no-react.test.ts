import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const simulationDir = dirname(fileURLToPath(import.meta.url))

describe('simulation core isolation', () => {
  it('does not import React', () => {
    const files = readdirSync(simulationDir).filter((name) => name.endsWith('.ts'))
    for (const file of files) {
      const source = readFileSync(join(simulationDir, file), 'utf8')
      expect(source, file).not.toMatch(/from ['"]react['"]/)
      expect(source, file).not.toMatch(/from ['"]react\//)
    }
  })
})
