import { describe, expect, it } from 'vitest'
import { actIOpeningQuota } from '@devedesiatky/content'
import { createRng } from '../rng'
import { createEmptyDeckLobby, quarterScore, reduceDeck } from './reduce'

describe('deck reducer (#27)', () => {
  it('START_RUN builds shuffled deck and DRAW_HAND enters PLAY', () => {
    const lobby = createEmptyDeckLobby(1993)
    const started = reduceDeck(
      lobby,
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 1993 },
      createRng(0),
    )
    expect(started.phase).toBe('DRAW')
    expect(started.deck.length).toBeGreaterThanOrEqual(8)
    expect(started.drawPile.length).toBe(started.deck.length)
    expect(started.quota).toBe(actIOpeningQuota)

    const playing = reduceDeck(started, { type: 'DRAW_HAND' }, createRng(started.rngState))
    expect(playing.phase).toBe('PLAY')
    expect(playing.hand.length).toBe(playing.handSize)
    expect(playing.energy).toBe(playing.energyMax)
    expect(playing.quarterPodpora).toBe(0)
  })

  it('clean stub path clears opening kvóta and banks Preferencie / overkill Pokladňa', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(42),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 42 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))

    // Deterministic clear: three Míting (10×3=30 ≥ kvóta 20).
    const mitings = state.deck.filter((c) => c.cardId === 'miting').slice(0, 3)
    expect(mitings.length).toBe(3)
    state = {
      ...state,
      hand: mitings,
      drawPile: state.deck.filter((c) => !mitings.some((m) => m.instanceId === c.instanceId)),
      discardPile: [],
      energy: 3,
      quarterPodpora: 0,
      quarterMobilizacia: 0,
    }

    const preferencieBefore = state.resources.preferencie
    const pokladnaBefore = state.resources.pokladna

    for (const card of mitings) {
      state = reduceDeck(
        state,
        { type: 'PLAY_CARD', instanceId: card.instanceId },
        createRng(state.rngState),
      )
    }

    expect(quarterScore(state)).toBe(30)
    expect(quarterScore(state)).toBeGreaterThanOrEqual(actIOpeningQuota)

    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
    expect(state.phase).toBe('ACQUIRE')
    expect(state.lastCleared).toBe(true)
    expect(state.lastScore).toBe(30)
    expect(state.resources.preferencie).toBe(preferencieBefore + 1)
    expect(state.resources.pokladna).toBe(
      pokladnaBefore + (30 - actIOpeningQuota) * 1000,
    )
  })

  it('illegal PLAY_CARD outside PLAY is a no-op', () => {
    const started = reduceDeck(
      createEmptyDeckLobby(1),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 1 },
      createRng(0),
    )
    const next = reduceDeck(
      started,
      { type: 'PLAY_CARD', instanceId: 'nope' },
      createRng(started.rngState),
    )
    expect(next).toEqual(started)
  })
})
