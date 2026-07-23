import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState } from '@devedesiatky/simulation'
import { createGameStore } from './gameStore'
import { createMemoryStorage, createPersistence } from './persistence'

describe('native Peniaze / FNM phase', () => {
  const persistence = createPersistence(createMemoryStorage())
  let store = createGameStore({ persistence })

  beforeEach(async () => {
    await persistence.clear()
    store = createGameStore({ persistence })
  })

  it('assigns an FNM company through reduce and updates offered list', async () => {
    const state = createInitialState({
      seed: 42,
      preferencie: 12,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    expect(state.turnPhase).toBe('peniaze')
    expect(state.fnmOffered.length).toBeGreaterThan(0)
    await persistence.save(state)
    await store.getState().hydrate()

    const companyId = store.getState().state.fnmOffered[0]
    const offeredBefore = store.getState().state.fnmOffered.length
    await store.getState().assignFnm(companyId, { kind: 'auction' })
    expect(store.getState().state.fnmOffered.length).toBeLessThan(offeredBefore)
  })

  it('finishPeniaze persists and survives hydrate', async () => {
    const state = createInitialState({
      seed: 42,
      preferencie: 12,
      preset: 'hnutie-machine',
      openPeniaze: true,
    })
    await persistence.save(state)
    await store.getState().hydrate()

    await store.getState().finishPeniaze()
    expect(store.getState().state.turnPhase).not.toBe('peniaze')

    const saved = await persistence.load()
    expect(saved?.turnPhase).not.toBe('peniaze')

    const again = createGameStore({ persistence })
    await again.getState().hydrate()
    expect(again.getState().state.turnPhase).toBe(saved?.turnPhase)
  })
})
