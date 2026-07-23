import { describe, expect, it } from 'vitest'
import { createInitialState } from './createInitialState'
import { createRng } from './rng'
import { reduce } from './reduce'

describe('timeline events + fact cards', () => {
  it('fires the quarter timeline event with role-specific choices', () => {
    let state = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      year: 1993,
      quarter: 1,
    })

    state = reduce(state, { type: 'FINISH_PENIAZE' }, createRng(state.rngState))
    // From centrala, force end-of-quarter event open for Q1
    state = {
      ...state,
      turnPhase: 'centrala',
      year: 1993,
      quarter: 1,
      resolvedEventIds: [],
    }
    state = reduce(state, { type: 'TRY_OPEN_EVENT' }, createRng(state.rngState))

    expect(state.turnPhase).toBe('event')
    expect(state.activeEventId).toBe('vznik-republiky')

    const opp = createInitialState({
      seed: 7,
      preferencie: 10,
      preset: 'challenger',
      year: 1993,
      quarter: 1,
    })
    let oppState = reduce(
      {
        ...opp,
        turnPhase: 'centrala',
        resolvedEventIds: [],
      },
      { type: 'TRY_OPEN_EVENT' },
      createRng(opp.rngState),
    )
    expect(oppState.activeEventId).toBe('vznik-republiky')

    // Resolve with gov choice
    state = reduce(
      state,
      { type: 'RESOLVE_EVENT', choiceId: 'celebrate' },
      createRng(state.rngState),
    )
    expect(state.resolvedEventIds).toContain('vznik-republiky')
    expect(state.pendingFactId).toBe('fact-vznik-republiky')
  })

  it('Kupónka cancel unlocks full patronage with trust debt; continue keeps limited power', () => {
    const base = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      year: 1993,
      quarter: 3,
      openPeniaze: true,
    })

    let cancelPath = reduce(
      {
        ...base,
        turnPhase: 'event',
        activeEventId: 'kuponka',
        patronagePower: 'limited',
        trustDebt: 0,
        resolvedEventIds: [],
        pendingFactId: null,
        collectedFactIds: [],
      },
      { type: 'RESOLVE_EVENT', choiceId: 'cancel-wave' },
      createRng(base.rngState),
    )
    expect(cancelPath.patronagePower).toBe('full')
    expect(cancelPath.trustDebt).toBeGreaterThan(0)

    let continuePath = reduce(
      {
        ...base,
        turnPhase: 'event',
        activeEventId: 'kuponka',
        patronagePower: 'limited',
        trustDebt: 0,
        resolvedEventIds: [],
        pendingFactId: null,
        collectedFactIds: [],
      },
      { type: 'RESOLVE_EVENT', choiceId: 'continue-wave' },
      createRng(base.rngState),
    )
    expect(continuePath.patronagePower).toBe('limited')
    expect(continuePath.preferencie).toBeGreaterThan(cancelPath.preferencie - 2)
  })

  it('collects skippable fact cards onto the Časová os', () => {
    let state = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
    })
    state = {
      ...state,
      turnPhase: 'fact',
      pendingFactId: 'fact-vznik-republiky',
      collectedFactIds: [],
      activeEventId: null,
    }

    state = reduce(state, { type: 'COLLECT_FACT' }, createRng(state.rngState))
    expect(state.collectedFactIds).toContain('fact-vznik-republiky')
    expect(state.pendingFactId).toBeNull()
    expect(state.turnPhase).toBe('centrala')

    state = {
      ...state,
      turnPhase: 'fact',
      pendingFactId: 'fact-kuponka',
    }
    state = reduce(state, { type: 'DISMISS_FACT' }, createRng(state.rngState))
    expect(state.collectedFactIds).not.toContain('fact-kuponka')
    expect(state.pendingFactId).toBeNull()
  })
})
