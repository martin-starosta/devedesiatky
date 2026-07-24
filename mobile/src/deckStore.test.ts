import { describe, expect, it } from 'vitest'
import { createDeckStore } from './deckStore'
import { createDeckMemoryStorage, createDeckPersistence } from './deckPersistence'

describe('deckStore', () => {
  it('starts a run, saves, and resumes phase after hydrate', async () => {
    const persistence = createDeckPersistence(createDeckMemoryStorage())
    const useStore = createDeckStore({ persistence, seed: 7 })
    await useStore.getState().startRun({ archetypeId: 'stroj-moci', seed: 7 })
    let state = useStore.getState().state
    expect(state.phase).toBe('PLAY')
    expect(useStore.getState().hasSave).toBe(true)

    const mitings = state.hand.filter((c) => c.cardId === 'miting')
    for (const card of mitings.slice(0, Math.min(3, mitings.length))) {
      await useStore.getState().playCard(card.instanceId)
    }
    await useStore.getState().endQuarter()
    state = useStore.getState().state
    expect(state.phase).toBe('ACQUIRE')

    const resumed = createDeckStore({ persistence, seed: 7 })
    await resumed.getState().hydrate()
    expect(resumed.getState().state.phase).toBe('ACQUIRE')
    expect(resumed.getState().state.lastScore).toBe(state.lastScore)
  })
})
