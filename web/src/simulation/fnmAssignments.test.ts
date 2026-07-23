import { describe, expect, it } from 'vitest'
import { createInitialState } from './createInitialState'
import { createRng } from './rng'
import { reduce } from './reduce'

describe('FNM full assignments + Koalícia', () => {
  it('raises Koalícia for partner, Reputácia for auction, and costs for cancel', () => {
    let state = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    expect(state.koalicia).toBeGreaterThan(0)

    const [a, b, c] = state.fnmOffered
    const koaliciaBefore = state.koalicia
    const reputaciaBefore = state.reputacia
    const pokladnaBefore = state.pokladna
    const preferencieBefore = state.preferencie

    state = reduce(
      state,
      { type: 'ASSIGN_FNM', companyId: a, destination: { kind: 'partner' } },
      createRng(state.rngState),
    )
    expect(state.koalicia).toBeGreaterThan(koaliciaBefore)
    expect(state.pokladna).toBe(pokladnaBefore)
    expect(state.fnmAssigned[a]).toEqual({ kind: 'partner' })

    state = reduce(
      state,
      { type: 'ASSIGN_FNM', companyId: b, destination: { kind: 'auction' } },
      createRng(state.rngState),
    )
    expect(state.reputacia).toBeGreaterThan(reputaciaBefore)
    expect(state.pokladna).toBe(pokladnaBefore)
    expect(state.koalicia).toBeLessThan(koaliciaBefore + 20) // partner up, auction grumbles
    expect(state.fnmAssigned[b]).toEqual({ kind: 'auction' })

    if (c) {
      const koaliciaMid = state.koalicia
      state = reduce(
        state,
        { type: 'ASSIGN_FNM', companyId: c, destination: { kind: 'cancel' } },
        createRng(state.rngState),
      )
      expect(state.preferencie).toBeLessThan(preferencieBefore + 5)
      expect(state.koalicia).toBeLessThan(koaliciaMid)
      expect(state.fnmAssigned[c]).toEqual({ kind: 'cancel' })
      expect(state.fnmPool).toContain(c)
    }
  })

  it('still supports sponsor deals via ASSIGN_FNM', () => {
    let state = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    const companyId = state.fnmOffered[0]
    const before = state.pokladna
    state = reduce(
      state,
      {
        type: 'ASSIGN_FNM',
        companyId,
        destination: { kind: 'sponsor', sponsorId: 'zelezny-baron' },
      },
      createRng(state.rngState),
    )
    expect(state.pokladna).toBeGreaterThan(before)
    expect(state.kauzy).toHaveLength(1)
    expect(state.fnmAssigned[companyId]).toEqual({
      kind: 'sponsor',
      sponsorId: 'zelezny-baron',
    })
  })

  it('flips out of government when Koalícia collapses', () => {
    let state = createInitialState({
      seed: 11,
      preferencie: 10,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    state = {
      ...state,
      koalicia: 3,
      fnmOffered: ['oceliare-vychod', 'strojarne-povazie'],
    }

    state = reduce(
      state,
      {
        type: 'ASSIGN_FNM',
        companyId: 'oceliare-vychod',
        destination: { kind: 'cancel' },
      },
      createRng(state.rngState),
    )

    expect(state.koalicia).toBeLessThanOrEqual(0)
    expect(state.inGovernment).toBe(false)
    expect(state.turnPhase).toBe('centrala')
    expect(state.fnmOffered).toHaveLength(0)
  })
})
