import { describe, expect, it } from 'vitest'
import { createInitialState } from './createInitialState'
import { createRng } from './rng'
import { reduce } from './reduce'

/**
 * Dirty patronage path: sponsor deal → cash → kauza ledger → poll tick.
 */
describe('patronage thesis loop', () => {
  it('assigns a company to a sponsor for cash, kauza, and a deterministic poll swing', () => {
    let state = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    expect(state.inGovernment).toBe(true)
    expect(state.turnPhase).toBe('peniaze')
    expect(state.fnmOffered.length).toBeGreaterThanOrEqual(2)
    expect(state.fnmOffered.length).toBeLessThanOrEqual(4)

    const companyId = state.fnmOffered[0]
    const sponsorId = 'zelezny-baron'
    const pokladnaBefore = state.pokladna
    const preferencieBefore = state.preferencie

    state = reduce(
      state,
      { type: 'ASSIGN_TO_SPONSOR', companyId, sponsorId },
      createRng(state.rngState),
    )

    expect(state.pokladna).toBeGreaterThan(pokladnaBefore)
    expect(state.kauzy).toHaveLength(1)
    expect(state.kauzy[0]).toMatchObject({
      companyId,
      sponsorId,
      year: 1993,
      quarter: 1,
    })
    expect(state.fnmOffered).not.toContain(companyId)
    expect(state.fnmAssigned[companyId]).toEqual({
      kind: 'sponsor',
      sponsorId,
    })
    expect(state.preferencie).not.toBe(preferencieBefore)
    expect(state.kauzyPressure).toBeGreaterThan(0)

    const againStart = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    const again = reduce(
      againStart,
      {
        type: 'ASSIGN_TO_SPONSOR',
        companyId: againStart.fnmOffered[0],
        sponsorId: 'zelezny-baron',
      },
      createRng(againStart.rngState),
    )
    expect(again.pokladna).toBe(state.pokladna)
    expect(again.preferencie).toBe(state.preferencie)
    expect(again.kauzy).toEqual(state.kauzy)
  })

  it('refuses sponsor deals when not in government', () => {
    const state = createInitialState({
      seed: 7,
      preferencie: 10,
      preset: 'challenger',
    })
    expect(state.inGovernment).toBe(false)

    const forced = {
      ...state,
      turnPhase: 'peniaze' as const,
      fnmOffered: ['oceliare-vychod' as const],
    }
    const next = reduce(
      forced,
      {
        type: 'ASSIGN_TO_SPONSOR',
        companyId: 'oceliare-vychod',
        sponsorId: 'zelezny-baron',
      },
      createRng(forced.rngState),
    )
    expect(next.pokladna).toBe(forced.pokladna)
    expect(next.kauzy).toHaveLength(0)
  })
})
