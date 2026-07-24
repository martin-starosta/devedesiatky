import { describe, expect, it } from 'vitest'
import {
  actIOpeningQuota,
  actIQuarterCount,
  actIQuotaGrowthPerQuarter,
  quotaMissPreferencieBleed,
} from '@devedesiatky/content'
import { createRng } from '../rng'
import {
  createEmptyDeckLobby,
  quarterScore,
  quotaForQuarter,
  reduceDeck,
} from './reduce'
import type { DeckRunState } from './types'

function playMitings(state: DeckRunState, count: number): DeckRunState {
  const mitings = state.deck.filter((c) => c.cardId === 'miting').slice(0, count)
  let next: DeckRunState = {
    ...state,
    phase: 'PLAY',
    hand: mitings,
    drawPile: state.deck.filter((c) => !mitings.some((m) => m.instanceId === c.instanceId)),
    discardPile: [],
    energy: count,
    quarterPodpora: 0,
    quarterMobilizacia: 0,
  }
  for (const card of mitings) {
    next = reduceDeck(
      next,
      { type: 'PLAY_CARD', instanceId: card.instanceId },
      createRng(next.rngState),
    )
  }
  return next
}

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

    const preferencieBefore = state.resources.preferencie
    const pokladnaBefore = state.resources.pokladna
    state = playMitings(state, 3)
    expect(quarterScore(state)).toBe(30)

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

describe('deck Act I clock (#28)', () => {
  it('raises kvóta each quarter and walks all 6 into BOSS', () => {
    expect(quotaForQuarter(1)).toBe(actIOpeningQuota)
    expect(quotaForQuarter(2)).toBe(actIOpeningQuota + actIQuotaGrowthPerQuarter)
    expect(quotaForQuarter(6)).toBe(
      actIOpeningQuota + 5 * actIQuotaGrowthPerQuarter,
    )

    let state = reduceDeck(
      createEmptyDeckLobby(99),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 99 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))

    for (let q = 1; q <= actIQuarterCount; q++) {
      expect(state.quarter).toBe(q)
      expect(state.quota).toBe(quotaForQuarter(q))
      state = playMitings(state, 3)
      state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
      if (q < actIQuarterCount) {
        expect(state.phase).toBe('ACQUIRE')
        state = reduceDeck(state, { type: 'SHOP_SKIP' }, createRng(state.rngState))
        expect(state.phase).toBe('PLAY')
      } else {
        expect(state.phase).toBe('BOSS')
      }
    }
    expect(state.year).toBe(1994)
    expect(state.calendarQuarter).toBe(2)
  })

  it('miss bleeds Preferencie; severe miss sets bossAdvantage', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(3),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 3 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))
    const before = state.resources.preferencie
    state = {
      ...state,
      phase: 'PLAY',
      quarterPodpora: 0,
      quarterMobilizacia: 0,
      energy: 0,
    }
    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
    expect(state.lastCleared).toBe(false)
    expect(state.resources.preferencie).toBe(before - quotaMissPreferencieBleed)
    expect(state.bossAdvantage).toBe(true)
  })
})
