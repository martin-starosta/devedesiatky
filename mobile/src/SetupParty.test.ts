import { beforeEach, describe, expect, it } from 'vitest'
import { createGameStore } from './gameStore'
import { createMemoryStorage, createPersistence } from './persistence'

describe('native party founding', () => {
  const persistence = createPersistence(createMemoryStorage())
  let store = createGameStore({ persistence })

  beforeEach(async () => {
    await persistence.clear()
    store = createGameStore({ persistence })
  })

  it('founds via preset and persists', async () => {
    await store.getState().foundParty({ preset: 'challenger' })
    expect(store.getState().state.presetId).toBe('challenger')
    expect(store.getState().state.phase).toBe('playing')
    const saved = await persistence.load()
    expect(saved?.presetId).toBe('challenger')
  })

  it('founds via free ideology and persists', async () => {
    await store.getState().foundParty({
      ideology: { narodnyObciansky: 0.5, socialnyTrhovy: -0.2, vychodZapad: 0.1 },
    })
    expect(store.getState().state.phase).toBe('playing')
    expect(store.getState().state.presetId).toBeNull()
    expect(store.getState().state.ideology.narodnyObciansky).toBeCloseTo(0.5)
    expect(await persistence.load()).not.toBeNull()
  })
})
