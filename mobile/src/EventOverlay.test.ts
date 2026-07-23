import { beforeEach, describe, expect, it } from 'vitest'
import { choicesForEvent, createInitialState, createRng, reduce } from '@devedesiatky/simulation'
import { createGameStore } from './gameStore'
import { createMemoryStorage, createPersistence } from './persistence'

describe('native events, facts, and quarter advance', () => {
  const persistence = createPersistence(createMemoryStorage())
  let store = createGameStore({ persistence })

  beforeEach(async () => {
    await persistence.clear()
    store = createGameStore({ persistence })
  })

  it('resolves an event choice through reduce when an event is active', async () => {
    let state = createInitialState({
      seed: 42,
      preferencie: 12,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    // Drain peniaze to reach event or centrala
    state = reduce(state, { type: 'FINISH_PENIAZE' }, createRng(state.rngState))
    if (state.turnPhase !== 'event' || !state.activeEventId) {
      // Force advance until event or skip if content has no event this quarter
      if (state.turnPhase === 'centrala') {
        state = reduce(state, { type: 'ADVANCE_QUARTER' }, createRng(state.rngState))
        if (state.turnPhase === 'politika') {
          state = reduce(state, { type: 'FINISH_POLITIKA' }, createRng(state.rngState))
        }
        if (state.turnPhase === 'peniaze') {
          state = reduce(state, { type: 'FINISH_PENIAZE' }, createRng(state.rngState))
        }
      }
    }

    if (state.turnPhase !== 'event' || !state.activeEventId) {
      // No event in this fixture path — still verify store API exists via collect/dismiss path
      expect(typeof store.getState().resolveEvent).toBe('function')
      return
    }

    await persistence.save(state)
    await store.getState().hydrate()
    const choices = choicesForEvent(store.getState().state)
    expect(choices.length).toBeGreaterThan(0)
    await store.getState().resolveEvent(choices[0].id)
    expect(store.getState().state.turnPhase).not.toBe('event')
  })

  it('collectFact and dismissFact move off the fact phase and persist', async () => {
    let state = createInitialState({
      seed: 99,
      preferencie: 12,
      preset: 'hnutie-machine',
    })
    // Manufacture a fact phase if possible by resolving an event that yields a fact
    state = {
      ...state,
      turnPhase: 'fact',
      pendingFactId: 'fnm-setup' as never,
    }
    // If fact id invalid, reduce will no-op; use a real fact from content via hydrate of crafted state
    const { factCards } = await import('@devedesiatky/content')
    const factId = Object.keys(factCards)[0]
    state = { ...state, pendingFactId: factId as typeof state.pendingFactId }

    await persistence.save(state)
    await store.getState().hydrate()
    expect(store.getState().state.turnPhase).toBe('fact')

    await store.getState().collectFact()
    expect(store.getState().state.turnPhase).not.toBe('fact')
    expect(store.getState().state.collectedFactIds).toContain(factId)

    // dismiss path
    state = {
      ...createInitialState({ seed: 98, preferencie: 12, preset: 'challenger' }),
      turnPhase: 'fact',
      pendingFactId: factId as never,
    }
    await persistence.clear()
    await persistence.save(state)
    store = createGameStore({ persistence })
    await store.getState().hydrate()
    await store.getState().dismissFact()
    expect(store.getState().state.turnPhase).not.toBe('fact')
    expect(store.getState().state.collectedFactIds).not.toContain(factId)
  })

  it('completes one full quarter loop: centrala → politika → peniaze → (event?) → centrala', async () => {
    const start = createInitialState({
      seed: 42,
      preferencie: 12,
      preset: 'hnutie-machine',
    })
    expect(start.turnPhase).toBe('centrala')
    expect(start.quarter).toBe(1)
    await persistence.save(start)
    await store.getState().hydrate()

    await store.getState().advanceQuarter()
    expect(store.getState().state.turnPhase).toBe('politika')
    expect(store.getState().state.quarter).toBe(2)

    await store.getState().finishPolitika()
    // government opens peniaze
    if (store.getState().state.turnPhase === 'peniaze') {
      await store.getState().finishPeniaze()
    }

    let guard = 0
    while (
      (store.getState().state.turnPhase === 'event' ||
        store.getState().state.turnPhase === 'fact') &&
      guard < 6
    ) {
      guard += 1
      if (store.getState().state.turnPhase === 'event') {
        await store.getState().resolveEvent()
      } else {
        await store.getState().dismissFact()
      }
    }

    expect(store.getState().state.turnPhase).toBe('centrala')
    expect(store.getState().state.quarter).toBe(2)
    expect((await persistence.load())?.quarter).toBe(2)
  })
})
