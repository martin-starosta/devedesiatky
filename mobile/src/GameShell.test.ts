import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState } from '@devedesiatky/simulation'
import { createGameStore } from './gameStore'
import { createMemoryStorage, createPersistence } from './persistence'

describe('arcade shell store actions', () => {
  const persistence = createPersistence(createMemoryStorage())
  let store = createGameStore({ persistence })

  beforeEach(async () => {
    await persistence.clear()
    store = createGameStore({ persistence })
  })

  it('advanceQuarter from centrala enters politika and autosaves', async () => {
    const state = createInitialState({ seed: 42, preferencie: 12, preset: 'hnutie-machine' })
    expect(state.turnPhase).toBe('centrala')
    await persistence.save(state)
    await store.getState().hydrate()

    await store.getState().advanceQuarter()
    expect(store.getState().state.turnPhase).toBe('politika')
    expect((await persistence.load())?.turnPhase).toBe('politika')
  })

  it('finishPolitika continues the turn loop from a stub screen', async () => {
    const state = createInitialState({
      seed: 42,
      preferencie: 12,
      preset: 'hnutie-machine',
      openPolitika: true,
    })
    expect(state.turnPhase).toBe('politika')
    await persistence.save(state)
    await store.getState().hydrate()

    await store.getState().finishPolitika()
    expect(store.getState().state.turnPhase).not.toBe('politika')
  })
})
