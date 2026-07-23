import { beforeEach, describe, expect, it } from 'vitest'
import { availablePolitikaActions, createInitialState } from '@devedesiatky/simulation'
import { createGameStore } from './gameStore'
import { createMemoryStorage, createPersistence } from './persistence'

describe('native Politika phase', () => {
  const persistence = createPersistence(createMemoryStorage())
  let store = createGameStore({ persistence })

  beforeEach(async () => {
    await persistence.clear()
    store = createGameStore({ persistence })
  })

  it('lists available actions and spends AP through reduce', async () => {
    const state = createInitialState({
      seed: 42,
      preferencie: 12,
      preset: 'hnutie-machine',
      openPolitika: true,
    })
    await persistence.save(state)
    await store.getState().hydrate()

    const actions = availablePolitikaActions(store.getState().state.inGovernment)
    expect(actions.length).toBeGreaterThan(0)

    const apBefore = store.getState().state.actionPoints
    await store.getState().spendPolitika(actions[0])
    expect(store.getState().state.actionPoints).toBeLessThan(apBefore)
  })

  it('finishPolitika persists and survives hydrate', async () => {
    const state = createInitialState({
      seed: 42,
      preferencie: 12,
      preset: 'hnutie-machine',
      openPolitika: true,
    })
    await persistence.save(state)
    await store.getState().hydrate()

    await store.getState().finishPolitika()
    expect(store.getState().state.turnPhase).not.toBe('politika')

    const saved = await persistence.load()
    expect(saved?.turnPhase).not.toBe('politika')

    const again = createGameStore({ persistence })
    await again.getState().hydrate()
    expect(again.getState().state.turnPhase).toBe(saved?.turnPhase)
  })
})
