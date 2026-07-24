import { describe, expect, it } from 'vitest'
import { createDeckStore } from './deckStore'

describe('deckStore', () => {
  it('starts a run and can clear a quarter via play + end', () => {
    const useStore = createDeckStore({ seed: 7 })
    useStore.getState().startRun({ archetypeId: 'stroj-moci', seed: 7 })
    let state = useStore.getState().state
    expect(state.phase).toBe('PLAY')
    expect(state.hand.length).toBe(5)

    const mitings = state.hand.filter((c) => c.cardId === 'miting')
    for (const card of mitings.slice(0, Math.min(3, mitings.length))) {
      useStore.getState().playCard(card.instanceId)
    }
    // If fewer than 3 mitings in hand, end anyway — settle still transitions.
    useStore.getState().endQuarter()
    state = useStore.getState().state
    expect(state.phase).toBe('ACQUIRE')
    expect(state.lastScore).not.toBeNull()
  })
})
