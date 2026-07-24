import {
  actIOpeningQuota,
  actIQuarterCount,
  actIQuotaGrowthPerQuarter,
  deckArchetypes,
  defaultEnergyMax,
  defaultHandSize,
  overkillPokladnaPerPoint,
  quotaClearPreferencie,
  quotaMissPreferencieBleed,
  type DeckArchetypeId,
} from '@devedesiatky/content'
import { drawCards, shuffle } from './draw'
import { playCard } from './effects'
import type { DeckAction, DeckCardInstance, DeckRunState } from './types'
import type { Rng } from '../types'
import { createRng } from '../rng'

export function quotaForQuarter(quarter: number, quotaBase = actIOpeningQuota): number {
  return quotaBase + (quarter - 1) * actIQuotaGrowthPerQuarter
}

function yearQuarterForActQuarter(quarter: number): {
  year: number
  calendarQuarter: 1 | 2 | 3 | 4
} {
  // Act I: 1993 Q1 … 1994 Q2 (6 quarters).
  const index = quarter - 1
  const year = 1993 + Math.floor(index / 4)
  const calendarQuarter = ((index % 4) + 1) as 1 | 2 | 3 | 4
  return { year, calendarQuarter }
}

function mintDeck(
  cardIds: string[],
  startSeq: number,
): { cards: DeckCardInstance[]; nextSeq: number } {
  let seq = startSeq
  const cards = cardIds.map((cardId) => {
    const instanceId = `c${seq}`
    seq += 1
    return { instanceId, cardId: cardId as DeckCardInstance['cardId'] }
  })
  return { cards, nextSeq: seq }
}

export function createEmptyDeckLobby(seed = 1993): DeckRunState {
  const s = seed >>> 0
  return {
    seed: s,
    rngState: s,
    act: 1,
    quarter: 1,
    year: 1993,
    calendarQuarter: 1,
    phase: 'DRAW',
    acquireNode: null,
    archetypeId: 'stroj-moci',
    deck: [],
    hand: [],
    drawPile: [],
    discardPile: [],
    exhaustPile: [],
    energy: 0,
    energyMax: defaultEnergyMax,
    handSize: defaultHandSize,
    quota: actIOpeningQuota,
    quotaBase: actIOpeningQuota,
    quarterPodpora: 0,
    quarterMobilizacia: 0,
    lastScore: null,
    lastCleared: null,
    bossAdvantage: false,
    resources: {
      preferencie: 0,
      pokladna: 0,
      reputacia: 5,
      media: 0,
      koalicia: 50,
      kult: 0,
      slovenskoIndex: 50,
      offices: 0,
    },
    govOrOpposition: 'government',
    pendingFactId: null,
    collectedFactIds: [],
    nextInstanceSeq: 1,
  }
}

function startRun(
  archetypeId: DeckArchetypeId,
  seed: number,
  rng: Rng,
): DeckRunState {
  const archetype = deckArchetypes[archetypeId]
  const { year, calendarQuarter } = yearQuarterForActQuarter(1)
  const minted = mintDeck(archetype.startingDeck, 1)
  const drawPile = shuffle(minted.cards, rng)

  return {
    seed: seed >>> 0,
    rngState: rng.state,
    act: 1,
    quarter: 1,
    year,
    calendarQuarter,
    phase: 'DRAW',
    acquireNode: null,
    archetypeId,
    deck: [...minted.cards],
    hand: [],
    drawPile,
    discardPile: [],
    exhaustPile: [],
    energy: 0,
    energyMax: defaultEnergyMax,
    handSize: defaultHandSize,
    quota: quotaForQuarter(1),
    quotaBase: actIOpeningQuota,
    quarterPodpora: 0,
    quarterMobilizacia: 0,
    lastScore: null,
    lastCleared: null,
    bossAdvantage: false,
    resources: {
      preferencie: archetype.preferencie,
      pokladna: archetype.pokladna,
      reputacia: 5,
      media: 1,
      koalicia: 55,
      kult: archetype.kult,
      slovenskoIndex: 50,
      offices: archetype.offices,
    },
    govOrOpposition: 'government',
    pendingFactId: null,
    collectedFactIds: [],
    nextInstanceSeq: minted.nextSeq,
  }
}

function drawHand(state: DeckRunState, rng: Rng): DeckRunState {
  if (state.phase !== 'DRAW') return state
  let discardPile = [...state.discardPile, ...state.hand]
  const result = drawCards(state.drawPile, discardPile, state.handSize, rng)
  return {
    ...state,
    phase: 'PLAY',
    hand: result.drawn,
    drawPile: result.drawPile,
    discardPile: result.discardPile,
    energy: state.energyMax,
    quarterPodpora: 0,
    quarterMobilizacia: 0,
    rngState: rng.state,
  }
}

function settleQuota(state: DeckRunState): DeckRunState {
  const mobilizacia = Math.max(1, state.quarterMobilizacia)
  const score = state.quarterPodpora * mobilizacia
  const cleared = score >= state.quota
  let preferencie = state.resources.preferencie
  let pokladna = state.resources.pokladna
  let bossAdvantage = state.bossAdvantage

  if (cleared) {
    preferencie += quotaClearPreferencie
    const overkill = score - state.quota
    if (overkill > 0) {
      pokladna += overkill * overkillPokladnaPerPoint
    }
  } else {
    preferencie = Math.max(0, preferencie - quotaMissPreferencieBleed)
    if (score < state.quota * 0.5) {
      bossAdvantage = true
    }
  }

  const afterQ6 = state.quarter >= actIQuarterCount
  return {
    ...state,
    phase: afterQ6 ? 'BOSS' : 'ACQUIRE',
    acquireNode: afterQ6 ? null : 'skip',
    lastScore: score,
    lastCleared: cleared,
    bossAdvantage,
    resources: {
      ...state.resources,
      preferencie,
      pokladna,
    },
    discardPile: [...state.discardPile, ...state.hand],
    hand: [],
    energy: 0,
    quarterPodpora: 0,
    quarterMobilizacia: 0,
  }
}

function endQuarter(state: DeckRunState): DeckRunState {
  if (state.phase !== 'PLAY') return state
  return settleQuota({ ...state, phase: 'RESOLVE' })
}

function advanceAfterAcquire(state: DeckRunState, rng: Rng): DeckRunState {
  if (state.phase !== 'ACQUIRE') return state
  if (state.quarter >= actIQuarterCount) {
    return { ...state, phase: 'BOSS', acquireNode: null }
  }
  const quarter = state.quarter + 1
  const { year, calendarQuarter } = yearQuarterForActQuarter(quarter)
  const combined = shuffle([...state.drawPile, ...state.discardPile], rng)
  return drawHand(
    {
      ...state,
      quarter,
      year,
      calendarQuarter,
      quota: quotaForQuarter(quarter, state.quotaBase),
      acquireNode: null,
      phase: 'DRAW',
      drawPile: combined,
      discardPile: [],
      hand: [],
      rngState: rng.state,
    },
    rng,
  )
}

/**
 * Pure deck-run reducer. Signature: (state, action, rng) → state
 * Illegal actions for the current phase are no-ops.
 */
export function reduceDeck(
  state: DeckRunState,
  action: DeckAction,
  rng: Rng,
): DeckRunState {
  switch (action.type) {
    case 'START_RUN': {
      const runRng = createRng(action.seed >>> 0)
      return startRun(action.archetypeId, action.seed, runRng)
    }
    case 'DRAW_HAND':
      return drawHand(state, rng)
    case 'PLAY_CARD': {
      if (state.phase !== 'PLAY') return state
      return playCard(state, action.instanceId, rng)
    }
    case 'END_QUARTER':
      return endQuarter(state)
    case 'SHOP_SKIP':
      return advanceAfterAcquire(state, rng)
    case 'COLLECT_FACT':
    case 'DISMISS_FACT':
      if (state.phase !== 'FACT') return state
      return { ...state, pendingFactId: null, phase: 'ACQUIRE' }
    default:
      return state
  }
}

export function quarterScore(state: DeckRunState): number {
  return state.quarterPodpora * Math.max(1, state.quarterMobilizacia)
}
