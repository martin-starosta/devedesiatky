import { describe, expect, it } from 'vitest'
import { createInitialState } from './createInitialState'
import { createRng } from './rng'
import { reduce } from './reduce'
import type { GameState, KauzaEntry } from './types'

function withLedger(state: GameState, entries: KauzaEntry[]): GameState {
  const pressure = entries
    .filter((e) => e.status === 'latent' || e.status === 'muted')
    .reduce((sum, e) => sum + e.pressure, 0)
  return {
    ...state,
    kauzy: entries,
    kauzyPressure: Math.round(pressure * 10) / 10,
  }
}

const pressKauza: KauzaEntry = {
  id: 'deal-press',
  companyId: 'oceliare-vychod',
  sponsorId: 'zelezny-baron',
  year: 1993,
  quarter: 1,
  pressure: 4,
  conditions: ['journalist'],
  status: 'latent',
}

const defectorKauza: KauzaEntry = {
  id: 'deal-defector',
  companyId: 'strojarne-povazie',
  sponsorId: 'fondovy-zralok',
  year: 1993,
  quarter: 2,
  pressure: 3.5,
  conditions: ['defector'],
  status: 'latent',
}

const powerKauza: KauzaEntry = {
  id: 'deal-power',
  companyId: 'banictvo-stred',
  sponsorId: 'zelezny-baron',
  year: 1993,
  quarter: 3,
  pressure: 5,
  conditions: ['lossOfPower'],
  status: 'latent',
}

describe('Kauzy condition fires', () => {
  it('journalist (press) detonation swings Preferencie and Reputácia via the reducer', () => {
    let state = createInitialState({
      seed: 11,
      preferencie: 12,
      preset: 'challenger',
      openPolitika: true,
    })
    state = withLedger(state, [pressKauza])
    const preferencieBefore = state.preferencie
    const reputaciaBefore = state.reputacia

    state = reduce(
      state,
      { type: 'SPEND_POLITIKA', actionId: 'investigate-kauza' },
      createRng(state.rngState),
    )

    const entry = state.kauzy.find((k) => k.id === 'deal-press')
    expect(entry?.status).toBe('detonated')
    expect(state.preferencie).toBeLessThan(preferencieBefore)
    expect(state.reputacia).toBeLessThan(reputaciaBefore)
    expect(state.kauzyPressure).toBeLessThan(4)
  })

  it('defector detonation fires on appoint-loyalist without a countdown timer', () => {
    let state = createInitialState({
      seed: 22,
      preferencie: 12,
      preset: 'hnutie-machine',
      openPolitika: true,
    })
    state = withLedger(state, [defectorKauza])
    const preferencieBefore = state.preferencie

    state = reduce(
      state,
      { type: 'SPEND_POLITIKA', actionId: 'appoint-loyalist' },
      createRng(state.rngState),
    )

    expect(state.kauzy.find((k) => k.id === 'deal-defector')?.status).toBe('detonated')
    expect(state.preferencie).toBeLessThan(preferencieBefore)
  })

  it('high Médiá mutes kauza impact at a Reputácia cost', () => {
    let state = createInitialState({
      seed: 33,
      preferencie: 12,
      preset: 'challenger',
      openPolitika: true,
    })
    state = {
      ...withLedger(state, [pressKauza]),
      media: 8,
      reputacia: 6,
    }
    const preferencieBefore = state.preferencie
    const reputaciaBefore = state.reputacia

    state = reduce(
      state,
      { type: 'SPEND_POLITIKA', actionId: 'investigate-kauza' },
      createRng(state.rngState),
    )

    const entry = state.kauzy.find((k) => k.id === 'deal-press')
    expect(entry?.status).toBe('muted')
    // Muted swing is smaller than a full detonation would be (~pressure * 0.8)
    expect(preferencieBefore - state.preferencie).toBeLessThan(2.5)
    expect(state.reputacia).toBeLessThan(reputaciaBefore)
  })

  it('loss of power opens hostile ledger and detonates lossOfPower tags', () => {
    let state = createInitialState({
      seed: 44,
      preferencie: 12,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    state = {
      ...withLedger(state, [powerKauza]),
      koalicia: 0.1,
      turnPhase: 'peniaze',
      fnmOffered: ['potraviny-nitra'],
    }
    expect(state.inGovernment).toBe(true)
    expect(state.hostileLedger).toBeFalsy()

    state = reduce(
      state,
      {
        type: 'ASSIGN_FNM',
        companyId: 'potraviny-nitra',
        destination: { kind: 'cancel' },
      },
      createRng(state.rngState),
    )

    // cancel costs koalícia; with near-zero bar this collapses
    expect(state.inGovernment).toBe(false)
    expect(state.hostileLedger).toBe(true)
    expect(state.kauzy.find((k) => k.id === 'deal-power')?.status).toBe('detonated')
    expect(state.preferencie).toBeLessThan(12)
  })

  it('new sponsor deals write condition tags, not a fuse countdown', () => {
    let state = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    const companyId = state.fnmOffered[0]
    state = reduce(
      state,
      {
        type: 'ASSIGN_FNM',
        companyId,
        destination: { kind: 'sponsor', sponsorId: 'zelezny-baron' },
      },
      createRng(state.rngState),
    )

    const entry = state.kauzy[0]
    expect(entry.conditions).toEqual(
      expect.arrayContaining(['journalist', 'defector', 'lossOfPower']),
    )
    expect(entry.status).toBe('latent')
    expect(entry).not.toHaveProperty('fuseTurns')
  })
})
