import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState, snemField, MAJORITY_SEATS } from '@devedesiatky/simulation'
import { factCards } from '@devedesiatky/content'
import { createGameStore } from './gameStore'
import { createMemoryStorage, createPersistence } from './persistence'

describe('native Snem and Časová os', () => {
  const persistence = createPersistence(createMemoryStorage())
  let store = createGameStore({ persistence })

  beforeEach(async () => {
    await persistence.clear()
    store = createGameStore({ persistence })
  })

  it('snemField exposes seats and majority from live GameState', async () => {
    const state = createInitialState({
      seed: 42,
      preferencie: 14,
      preset: 'hnutie-machine',
    })
    await persistence.save(state)
    await store.getState().hydrate()

    const field = snemField(store.getState().state)
    expect(field.totalSeats).toBe(150)
    expect(field.majority).toBe(MAJORITY_SEATS)
    expect(field.arcs.length).toBeGreaterThan(0)
    expect(field.arcs.every((a) => a.seats >= 0)).toBe(true)
    expect(field.coalitionSeats).toBeGreaterThanOrEqual(0)
  })

  it('Časová os reads collectedFactIds without mutating rules', async () => {
    const factId = Object.keys(factCards)[0]
    const state = {
      ...createInitialState({ seed: 7, preferencie: 12, preset: 'challenger' }),
      collectedFactIds: [factId as never],
    }
    await persistence.save(state)
    await store.getState().hydrate()

    expect(store.getState().state.collectedFactIds).toEqual([factId])
    expect(factCards[factId as keyof typeof factCards].titleSk.length).toBeGreaterThan(0)
    // read-only: hydrate did not invent extra facts
    expect(store.getState().state.collectedFactIds).toHaveLength(1)
  })
})
