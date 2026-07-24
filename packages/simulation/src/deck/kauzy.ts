import {
  detonationSwing,
  isKauzaCardId,
  kauzaCards,
  mediaMuteThreshold,
  mutePreferencieFactor,
  muteReputaciaCost,
  type KauzaCondition,
  type KauzaStatus,
} from '@devedesiatky/content'
import type { DeckCardInstance, DeckRunState } from './types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function armCondition(
  state: DeckRunState,
  condition: KauzaCondition,
): DeckRunState {
  if (state.armedConditions.includes(condition)) return state
  let next: DeckRunState = {
    ...state,
    armedConditions: [...state.armedConditions, condition],
  }
  // On-condition-arm: scan hand only.
  next = attemptDetonations(next, next.hand.map((c) => c.instanceId))
  return next
}

export function clearTransientArmedConditions(state: DeckRunState): DeckRunState {
  // lossOfPower is persistent until handled; others clear each quarter.
  return {
    ...state,
    armedConditions: state.armedConditions.filter((c) => c === 'lossOfPower'),
  }
}

function attemptOne(
  state: DeckRunState,
  instanceId: string,
): DeckRunState {
  const card = [...state.hand, ...state.drawPile, ...state.discardPile, ...state.exhaustPile].find(
    (c) => c.instanceId === instanceId,
  )
  if (!card || !isKauzaCardId(card.cardId)) return state
  const status = card.kauzaStatus ?? 'latent'
  if (status !== 'latent') return state

  const def = kauzaCards[card.cardId]
  const matching = def.conditions.filter((c) => state.armedConditions.includes(c))
  if (matching.length === 0) return state

  const canMute = !state.hostileKauzy && state.resources.media >= mediaMuteThreshold
  if (canMute) {
    return applyMute(state, instanceId, def.pressure)
  }
  if (def.nevymazatelnaOnDetonate) {
    return markCardStatus(state, instanceId, 'nevymazatelna')
  }
  return applyDetonation(state, instanceId, def.pressure)
}

function markCardStatus(
  state: DeckRunState,
  instanceId: string,
  kauzaStatus: NonNullable<DeckCardInstance['kauzaStatus']>,
): DeckRunState {
  const patch = (list: DeckCardInstance[]) =>
    list.map((c) => (c.instanceId === instanceId ? { ...c, kauzaStatus } : c))
  return {
    ...state,
    hand: patch(state.hand),
    drawPile: patch(state.drawPile),
    discardPile: patch(state.discardPile),
    exhaustPile: patch(state.exhaustPile),
    deck: patch(state.deck),
  }
}

function applyMute(state: DeckRunState, instanceId: string, pressure: number): DeckRunState {
  const preferencieHit = pressure * detonationSwing.preferencie * mutePreferencieFactor
  let next = markCardStatus(state, instanceId, 'muted')
  next = {
    ...next,
    resources: {
      ...next.resources,
      preferencie: round1(next.resources.preferencie - preferencieHit),
      reputacia: round1(next.resources.reputacia - muteReputaciaCost),
      // MVP-B hook: Slovensko index would drop here too.
      slovenskoIndex: round1(next.resources.slovenskoIndex - 0.5),
    },
  }
  return next
}

function applyDetonation(
  state: DeckRunState,
  instanceId: string,
  pressure: number,
): DeckRunState {
  const preferencieHit = pressure * detonationSwing.preferencie
  const reputaciaHit = pressure * detonationSwing.reputacia
  let next = markCardStatus(state, instanceId, 'detonated')
  // Move detonated kauza to exhaust so it stops clogging reshuffles (unless nevymazatelna).
  const fromHand = next.hand.find((c) => c.instanceId === instanceId)
  const fromDiscard = next.discardPile.find((c) => c.instanceId === instanceId)
  const victim = fromHand ?? fromDiscard
  if (victim) {
    next = {
      ...next,
      hand: next.hand.filter((c) => c.instanceId !== instanceId),
      discardPile: next.discardPile.filter((c) => c.instanceId !== instanceId),
      exhaustPile: [...next.exhaustPile, { ...victim, kauzaStatus: 'detonated' }],
    }
  }
  return {
    ...next,
    resources: {
      ...next.resources,
      preferencie: round1(next.resources.preferencie - preferencieHit),
      reputacia: round1(next.resources.reputacia - reputaciaHit),
    },
  }
}

/** Attempt detonation for specific instance ids (must be kauzy currently relevant). */
export function attemptDetonations(
  state: DeckRunState,
  instanceIds: string[],
): DeckRunState {
  let next = state
  for (const id of instanceIds) {
    next = attemptOne(next, id)
  }
  return next
}

/** On-draw checks for newly drawn cards. */
export function onCardsDrawn(
  state: DeckRunState,
  drawn: DeckCardInstance[],
): DeckRunState {
  const kauzaIds = drawn
    .filter((c) => isKauzaCardId(c.cardId))
    .map((c) => c.instanceId)
  if (kauzaIds.length === 0) return state
  return attemptDetonations(state, kauzaIds)
}

/** On-resolve: every kauza still in hand. */
export function onResolveKauzy(state: DeckRunState): DeckRunState {
  const ids = state.hand
    .filter((c) => isKauzaCardId(c.cardId))
    .map((c) => c.instanceId)
  return attemptDetonations(state, ids)
}

export type { KauzaCondition, KauzaStatus }
