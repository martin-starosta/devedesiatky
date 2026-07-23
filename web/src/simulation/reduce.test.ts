import { describe, expect, it } from 'vitest'
import { createInitialState } from './createInitialState'
import { createRng } from './rng'
import { reduce } from './reduce'

/**
 * Fixture style for later MVP slices:
 * fixed seed + content stubs + action scripts against the reducer seam.
 */
describe('quarterly simulation reducer', () => {
  it('advances quarter deterministically for a fixed seed', () => {
    const start = createInitialState({ seed: 42 })
    expect(start.preferencie).toBe(10)
    expect(start.year).toBe(1993)
    expect(start.quarter).toBe(1)

    const rngA = createRng(start.rngState)
    const next = reduce(start, { type: 'ADVANCE_QUARTER' }, rngA)

    expect(next.year).toBe(1993)
    expect(next.quarter).toBe(2)
    expect(next.preferencie).toBe(start.preferencie)
    expect(next.rngState).not.toBe(start.rngState)

    const rngB = createRng(start.rngState)
    const again = reduce(start, { type: 'ADVANCE_QUARTER' }, rngB)
    expect(again).toEqual(next)
  })

  it('rolls year when advancing from Q4', () => {
    const start = createInitialState({ seed: 7, year: 1993, quarter: 4 })
    const next = reduce(start, { type: 'ADVANCE_QUARTER' }, createRng(start.rngState))

    expect(next.year).toBe(1994)
    expect(next.quarter).toBe(1)
  })
})
