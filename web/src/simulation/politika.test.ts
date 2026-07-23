import { describe, expect, it } from 'vitest'
import { createInitialState } from './createInitialState'
import { createRng } from './rng'
import { reduce } from './reduce'

describe('Politika phase', () => {
  it('enforces a 2–3 AP budget and applies government actions for a fixed seed', () => {
    let state = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      openPolitika: true,
    })

    expect(state.turnPhase).toBe('politika')
    expect(state.inGovernment).toBe(true)
    expect(state.actionPoints).toBeGreaterThanOrEqual(2)
    expect(state.actionPoints).toBeLessThanOrEqual(3)
    expect(state.reputacia).toBeDefined()
    expect(state.media).toBeDefined()

    const ap = state.actionPoints
    const mediaBefore = state.media
    const reputaciaBefore = state.reputacia

    state = reduce(
      state,
      { type: 'SPEND_POLITIKA', actionId: 'appoint-loyalist' },
      createRng(state.rngState),
    )

    expect(state.actionPoints).toBe(ap - 1)
    expect(state.media).toBeGreaterThan(mediaBefore)
    expect(state.reputacia).toBeLessThan(reputaciaBefore)

    // Spending with 0 AP is a no-op
    state = { ...state, actionPoints: 0 }
    const frozen = reduce(
      state,
      { type: 'SPEND_POLITIKA', actionId: 'pressure-media' },
      createRng(state.rngState),
    )
    expect(frozen.media).toBe(state.media)
    expect(frozen.actionPoints).toBe(0)

    const again = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      openPolitika: true,
    })
    expect(again.actionPoints).toBe(ap)
  })

  it('uses a different opposition action set that mutates Preferencie and Reputácia', () => {
    let state = createInitialState({
      seed: 99,
      preferencie: 10,
      preset: 'challenger',
      openPolitika: true,
    })

    expect(state.inGovernment).toBe(false)
    expect(state.turnPhase).toBe('politika')

    const preferencieBefore = state.preferencie
    const reputaciaBefore = state.reputacia

    state = reduce(
      state,
      { type: 'SPEND_POLITIKA', actionId: 'foreign-photo-op' },
      createRng(state.rngState),
    )

    expect(state.reputacia).toBeGreaterThan(reputaciaBefore)
    expect(state.preferencie).toBeGreaterThanOrEqual(preferencieBefore)

    // Government-only action is rejected for opposition
    const rejected = reduce(
      state,
      { type: 'SPEND_POLITIKA', actionId: 'appoint-loyalist' },
      createRng(state.rngState),
    )
    expect(rejected.actionPoints).toBe(state.actionPoints)
    expect(rejected.media).toBe(state.media)
  })
})
