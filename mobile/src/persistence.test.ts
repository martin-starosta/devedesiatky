import { describe, expect, it } from 'vitest'
import { createBootstrapState, createRng, reduce } from '@devedesiatky/simulation'
import {
  createMemoryStorage,
  createPersistence,
  SAVE_VERSION,
  type PersistenceStorage,
} from './persistence'

describe('persistence adapter', () => {
  it('round-trips GameState through save/load', async () => {
    const storage = createMemoryStorage()
    const persistence = createPersistence(storage)
    const state = createBootstrapState({ seed: 1993 })

    await persistence.save(state)
    const loaded = await persistence.load()

    expect(loaded).toEqual(state)
  })

  it('clear removes the saved run', async () => {
    const storage = createMemoryStorage()
    const persistence = createPersistence(storage)
    await persistence.save(createBootstrapState({ seed: 1 }))

    await persistence.clear()

    expect(await persistence.load()).toBeNull()
  })

  it('corrupt or incompatible saves fall back to null without throwing', async () => {
    const storage: PersistenceStorage = {
      getItem: async () => '{not-json',
      setItem: async () => {},
      removeItem: async () => {},
    }
    const persistence = createPersistence(storage)

    await expect(persistence.load()).resolves.toBeNull()

    const badVersion = createMemoryStorage()
    await badVersion.setItem(
      'devedesiatky.save',
      JSON.stringify({ version: SAVE_VERSION + 99, state: createBootstrapState({ seed: 2 }) }),
    )
    await expect(createPersistence(badVersion).load()).resolves.toBeNull()
  })
})

describe('game store persistence', () => {
  it('hydrates from a valid save on cold start', async () => {
    const { createGameStore } = await import('./gameStore')
    const storage = createMemoryStorage()
    const persistence = createPersistence(storage)
    let state = createBootstrapState({ seed: 1993 })
    state = reduce(state, { type: 'FOUND_PARTY', preset: 'hnutie-machine' }, createRng(state.rngState))
    await persistence.save(state)

    const store = createGameStore({ persistence })
    await store.getState().hydrate()

    expect(store.getState().state.phase).toBe('playing')
    expect(store.getState().state.preferencie).toBeGreaterThan(0)
    expect(store.getState().hasSave).toBe(true)
  })

  it('newGame requires confirmation when a save exists, then clears and bootstraps', async () => {
    const { createGameStore } = await import('./gameStore')
    const storage = createMemoryStorage()
    const persistence = createPersistence(storage)
    let state = createBootstrapState({ seed: 1993 })
    state = reduce(state, { type: 'FOUND_PARTY', preset: 'challenger' }, createRng(state.rngState))
    await persistence.save(state)

    const store = createGameStore({ persistence })
    await store.getState().hydrate()

    expect(store.getState().newGame({ confirmed: false })).toEqual({
      needsConfirmation: true,
    })
    expect(store.getState().state.phase).toBe('playing')

    await store.getState().newGame({ confirmed: true })
    expect(store.getState().state.phase).toBe('setup')
    expect(store.getState().state.preferencie).toBe(0)
    expect(await persistence.load()).toBeNull()
  })

  it('autosaves after founding', async () => {
    const { createGameStore } = await import('./gameStore')
    const storage = createMemoryStorage()
    const persistence = createPersistence(storage)
    const store = createGameStore({ persistence })

    await store.getState().foundParty({ preset: 'hnutie-machine' })

    const saved = await persistence.load()
    expect(saved?.phase).toBe('playing')
    expect(saved?.preferencie).toBeGreaterThan(0)
  })
})
