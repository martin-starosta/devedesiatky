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
import { bossEndTurn, enterBoss, maybeBossWin } from './boss'
import { drawCards, shuffle } from './draw'
import { playCard } from './effects'
import {
  collectDeckFact,
  dismissDeckFact,
  openDeckEvent,
  resolveDeckEvent,
} from './events'
import {
  clearTransientArmedConditions,
  onCardsDrawn,
  onResolveKauzy,
  armCondition,
} from './kauzy'
import { normalizeDeckRunState } from './normalize'
import {
  claimRelic,
  effectiveHandSize,
  openInstitution,
  openRest,
  removeCard,
  upgradeCard,
  useSisExile,
} from './relics'
import { openShop, shopBuy, takePatronage } from './shop'
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
    boss: null,
    hostileKauzy: false,
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
    activeEventId: null,
    resolvedEventIds: [],
    pendingFactId: null,
    collectedFactIds: [],
    factOpens: 0,
    phaseAfterFact: null,
    shopOffers: null,
    sponsors: [],
    armedConditions: [],
    relics: [],
    pozornost: 0,
    sisExileUsedThisAct: false,
    restRemovesUsed: 0,
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
    boss: null,
    hostileKauzy: false,
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
    activeEventId: null,
    resolvedEventIds: [],
    pendingFactId: null,
    collectedFactIds: [],
    factOpens: 0,
    phaseAfterFact: null,
    shopOffers: null,
    sponsors: [],
    armedConditions: [],
    relics: [],
    pozornost: 0,
    sisExileUsedThisAct: false,
    restRemovesUsed: 0,
    nextInstanceSeq: minted.nextSeq,
  }
}

function drawHand(state: DeckRunState, rng: Rng): DeckRunState {
  if (state.phase !== 'DRAW') return state
  let discardPile = [...state.discardPile, ...state.hand]
  const result = drawCards(state.drawPile, discardPile, effectiveHandSize(state), rng)
  let next: DeckRunState = {
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
  next = onCardsDrawn(next, result.drawn)
  return next
}

function settleQuota(state: DeckRunState, rng: Rng): DeckRunState {
  // On-resolve kauzy before scoring.
  let next = onResolveKauzy(state)
  const mobilizacia = Math.max(1, next.quarterMobilizacia)
  const score = next.quarterPodpora * mobilizacia
  const cleared = score >= next.quota
  let preferencie = next.resources.preferencie
  let pokladna = next.resources.pokladna
  let bossAdvantage = next.bossAdvantage

  if (cleared) {
    preferencie += quotaClearPreferencie
    const overkill = score - next.quota
    if (overkill > 0) {
      pokladna += overkill * overkillPokladnaPerPoint
    }
  } else {
    preferencie = Math.max(0, preferencie - quotaMissPreferencieBleed)
    if (score < next.quota * 0.5) {
      bossAdvantage = true
    }
  }

  const settled: DeckRunState = {
    ...next,
    lastScore: score,
    lastCleared: cleared,
    bossAdvantage,
    resources: {
      ...next.resources,
      preferencie,
      pokladna,
    },
    discardPile: [...next.discardPile, ...next.hand],
    hand: [],
    energy: 0,
    quarterPodpora: 0,
    quarterMobilizacia: 0,
  }

  const afterQ6 = settled.quarter >= actIQuarterCount
  if (afterQ6) {
    return enterBoss({ ...settled, phase: 'BOSS', acquireNode: null }, rng)
  }
  return {
    ...settled,
    phase: 'ACQUIRE',
    acquireNode: 'skip',
  }
}

function endQuarter(state: DeckRunState, rng: Rng): DeckRunState {
  if (state.phase !== 'PLAY') return state
  return settleQuota({ ...state, phase: 'RESOLVE' }, rng)
}

function advanceAfterAcquire(state: DeckRunState, rng: Rng): DeckRunState {
  if (state.phase !== 'ACQUIRE') return state
  if (state.quarter >= actIQuarterCount) {
    return enterBoss({ ...state, phase: 'BOSS', acquireNode: null }, rng)
  }
  const quarter = state.quarter + 1
  const { year, calendarQuarter } = yearQuarterForActQuarter(quarter)
  const combined = shuffle([...state.drawPile, ...state.discardPile], rng)
  const advanced = clearTransientArmedConditions({
    ...state,
    quarter,
    year,
    calendarQuarter,
    quota: quotaForQuarter(quarter, state.quotaBase),
    acquireNode: null,
    shopOffers: null,
    phase: 'DRAW',
    drawPile: combined,
    discardPile: [],
    hand: [],
    rngState: rng.state,
  })
  return drawHand(advanced, rng)
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
  state = normalizeDeckRunState(state)
  switch (action.type) {
    case 'START_RUN': {
      const runRng = createRng(action.seed >>> 0)
      return startRun(action.archetypeId, action.seed, runRng)
    }
    case 'DRAW_HAND':
      return drawHand(state, rng)
    case 'PLAY_CARD': {
      if (state.phase !== 'PLAY') return state
      const beforeMedia = state.resources.media
      let next = playCard(state, action.instanceId, rng)
      if (next.resources.media > beforeMedia) {
        next = armCondition(next, 'journalist')
      }
      return next
    }
    case 'END_QUARTER':
      return endQuarter(state, rng)
    case 'SHOP_SKIP':
      return advanceAfterAcquire(state, rng)
    case 'OPEN_EVENT':
      return openDeckEvent(state)
    case 'OPEN_SHOP':
      return openShop(state, action.kind, rng)
    case 'OPEN_REST':
      return openRest(state)
    case 'OPEN_INSTITUTION':
      return openInstitution(state)
    case 'SHOP_BUY':
      return shopBuy(state, action.cardId, rng)
    case 'TAKE_PATRONAGE': {
      let next = takePatronage(state, action.cardId, rng, action.sponsorId)
      next = armCondition(next, 'journalist')
      next = armCondition(next, 'defector')
      return next
    }
    case 'REMOVE_CARD':
      return removeCard(state, action.instanceId)
    case 'UPGRADE_CARD':
      return upgradeCard(state, action.instanceId)
    case 'CLAIM_RELIC':
      return claimRelic(state, action.relicId)
    case 'USE_SIS_EXILE':
      return useSisExile(state, action.instanceId)
    case 'RESOLVE_EVENT':
      return resolveDeckEvent(state, action.choiceId)
    case 'COLLECT_FACT':
      return collectDeckFact(state)
    case 'DISMISS_FACT':
      return dismissDeckFact(state)
    case 'ARM_CONDITION':
      return armCondition(state, action.condition)
    case 'BOSS_PLAY': {
      if (state.phase !== 'BOSS' || !state.boss || state.boss.outcome) return state
      return maybeBossWin(playCard(state, action.instanceId, rng))
    }
    case 'BOSS_END_TURN':
      return bossEndTurn(state, rng)
    default:
      return state
  }
}

export function quarterScore(state: DeckRunState): number {
  return state.quarterPodpora * Math.max(1, state.quarterMobilizacia)
}
