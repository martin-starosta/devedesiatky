import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), 'theme.css'),
  'utf8',
)

describe('theme tokens', () => {
  it('defines Pulp Power palette tokens', () => {
    expect(css).toContain('--soot:')
    expect(css).toContain('--graphite:')
    expect(css).toContain('--bone:')
    expect(css).toContain('--ash:')
    expect(css).toContain('--blood:')
    expect(css).toContain('--signal:')
    expect(css).toContain('--mint:')
  })

  it('does not keep carpet/gold nostalgia tokens as primary brand', () => {
    expect(css).not.toMatch(/--carpet:\s*#3a1f28/i)
    expect(css).not.toMatch(/--gold:\s*#c4a35a/i)
  })
})
