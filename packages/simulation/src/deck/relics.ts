import {
  actIRelicIds,
  isKauzaCardId,
  relics,
  restRemovesPerAct,
  type RelicId,
} from '@devedesiatky/content'
import type { DeckCardInstance, DeckRunState } from './types'

export function openRest(state: DeckRunState): DeckRunState {
  if (state.phase !== 'ACQUIRE') return state
  if (state.acquireNode === 'event' && state.activeEventId) return state
  return { ...state, acquireNode: 'rest', shopOffers: null }
}

export function openInstitution(state: DeckRunState): DeckRunState {
  if (state.phase !== 'ACQUIRE') return state
  if (state.acquireNode === 'event' && state.activeEventId) return state
  return { ...state, acquireNode: 'institution', shopOffers: null }
}

export function removeCard(state: DeckRunState, instanceId: string): DeckRunState {
  if (state.phase !== 'ACQUIRE' || state.acquireNode !== 'rest') return state
  if (state.restRemovesUsed >= restRemovesPerAct) return state

  const inDiscard = state.discardPile.find((c) => c.instanceId === instanceId)
  const inDraw = state.drawPile.find((c) => c.instanceId === instanceId)
  const card = inDiscard ?? inDraw
  if (!card) return state
  if (card.kauzaStatus === 'nevymazatelna') return state

  const strip = (list: DeckCardInstance[]) =>
    list.filter((c) => c.instanceId !== instanceId)

  return {
    ...state,
    discardPile: strip(state.discardPile),
    drawPile: strip(state.drawPile),
    deck: strip(state.deck),
    exhaustPile: [...state.exhaustPile, card],
    restRemovesUsed: state.restRemovesUsed + 1,
    acquireNode: 'skip',
  }
}

export function upgradeCard(state: DeckRunState, instanceId: string): DeckRunState {
  if (state.phase !== 'ACQUIRE' || state.acquireNode !== 'rest') return state
  const patch = (list: DeckCardInstance[]) =>
    list.map((c) =>
      c.instanceId === instanceId && !c.upgraded ? { ...c, upgraded: true } : c,
    )
  const existed =
    state.discardPile.some((c) => c.instanceId === instanceId) ||
    state.drawPile.some((c) => c.instanceId === instanceId)
  if (!existed) return state
  return {
    ...state,
    discardPile: patch(state.discardPile),
    drawPile: patch(state.drawPile),
    deck: patch(state.deck),
    acquireNode: 'skip',
  }
}

export function claimRelic(state: DeckRunState, relicId: RelicId): DeckRunState {
  if (state.phase !== 'ACQUIRE' || state.acquireNode !== 'institution') return state
  if (!(relicId in relics)) return state
  if (state.relics.includes(relicId)) return state
  if (!actIRelicIds.includes(relicId)) return state

  let next: DeckRunState = {
    ...state,
    relics: [...state.relics, relicId],
    acquireNode: 'skip',
  }

  if (relicId === 'statna-tv') {
    next = {
      ...next,
      resources: { ...next.resources, media: next.resources.media + 1 },
    }
  }
  if (relicId === 'ustavna-vacina') {
    next = { ...next, handSize: 6 }
  }
  return next
}

/** SIS once/act: exile kauza from hand → exhaust, +Pozornosť. */
export function useSisExile(state: DeckRunState, instanceId: string): DeckRunState {
  if (!state.relics.includes('sis') || state.sisExileUsedThisAct) return state
  const card = state.hand.find((c) => c.instanceId === instanceId)
  if (!card || !isKauzaCardId(card.cardId)) return state
  return {
    ...state,
    hand: state.hand.filter((c) => c.instanceId !== instanceId),
    exhaustPile: [...state.exhaustPile, card],
    sisExileUsedThisAct: true,
    pozornost: state.pozornost + 1,
  }
}

export function effectiveHandSize(state: DeckRunState): number {
  return state.relics.includes('ustavna-vacina') ? 6 : state.handSize
}
