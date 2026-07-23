import { beforeEach, describe, expect, it } from 'vitest'
import { createBootstrapState } from '@devedesiatky/simulation'
import { createGameStore } from './gameStore'
import { createMemoryStorage, createPersistence } from './persistence'

describe('mobile game store', () => {
  const persistence = createPersistence(createMemoryStorage())
  let store = createGameStore({ persistence })

  beforeEach(async () => {
    await persistence.clear()
    store = createGameStore({ persistence })
  })

  it('boots from shared bootstrap GameState', () => {
    const { state } = store.getState()
    expect(state.phase).toBe('setup')
    expect(state.year).toBe(1993)
    expect(state.quarter).toBe(1)
    expect(state.preferencie).toBe(0)
  })

  it('dispatches through reduce (FOUND_PARTY)', async () => {
    await store.getState().foundParty({ preset: 'hnutie-machine' })
    const { state } = store.getState()
    expect(state.phase).toBe('playing')
    expect(state.preferencie).toBeGreaterThan(0)
    expect(state.presetId).toBe('hnutie-machine')
  })

  it('starts from bootstrap when no save exists', async () => {
    await store.getState().hydrate()
    expect(store.getState().state).toEqual(createBootstrapState({ seed: 1993 }))
    expect(store.getState().hasSave).toBe(false)
  })
})
