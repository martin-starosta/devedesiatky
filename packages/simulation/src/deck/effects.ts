import { lookupCard, type CardEffect } from '@devedesiatky/content'
import { drawCards } from './draw'
import { onCardsDrawn } from './kauzy'
import type { DeckRunState } from './types'
import type { Rng } from '../types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function statValue(state: DeckRunState, stat: 'kult' | 'offices' | 'media'): number {
  if (stat === 'kult') return state.resources.kult
  if (stat === 'offices') return state.resources.offices
  return state.resources.media
}

function energyCostFor(
  state: DeckRunState,
  cardInst: { cardId: string; upgraded?: boolean },
  baseCost: number,
): number {
  let cost = baseCost
  if (cardInst.upgraded) cost = Math.max(0, cost - 1)
  const def = lookupCard(cardInst.cardId)
  if (state.relics.includes('statna-tv') && def?.tags.includes('kult')) {
    cost = Math.max(0, cost - 1)
  }
  return cost
}

export function applyEffects(
  state: DeckRunState,
  effects: CardEffect[],
  rng: Rng,
): DeckRunState {
  let next = state
  for (const effect of effects) {
    next = applyOne(next, effect, rng)
  }
  return next
}

function applyOne(state: DeckRunState, effect: CardEffect, rng: Rng): DeckRunState {
  switch (effect.type) {
    case 'addPodpora':
      return { ...state, quarterPodpora: state.quarterPodpora + effect.amount }
    case 'addMobilizacia':
      return {
        ...state,
        quarterMobilizacia: state.quarterMobilizacia + effect.amount,
      }
    case 'addPodporaPer':
      return {
        ...state,
        quarterPodpora:
          state.quarterPodpora + effect.amount * statValue(state, effect.stat),
      }
    case 'addMobilizaciaPer':
      return {
        ...state,
        quarterMobilizacia:
          state.quarterMobilizacia + effect.amount * statValue(state, effect.stat),
      }
    case 'gainResource': {
      const resources = {
        ...state.resources,
        [effect.resource]: round1(state.resources[effect.resource] + effect.amount),
      }
      return { ...state, resources }
    }
    case 'gainEnergy':
      return {
        ...state,
        energy: Math.min(state.energyMax, state.energy + effect.amount),
      }
    case 'draw': {
      const result = drawCards(
        state.drawPile,
        state.discardPile,
        effect.amount,
        rng,
      )
      let next: DeckRunState = {
        ...state,
        hand: [...state.hand, ...result.drawn],
        drawPile: result.drawPile,
        discardPile: result.discardPile,
        rngState: rng.state,
      }
      next = onCardsDrawn(next, result.drawn)
      return next
    }
    case 'addKauza':
      return state
    case 'bossDamage':
    case 'bossBlock':
      return state
  }
}

export function playCard(
  state: DeckRunState,
  instanceId: string,
  rng: Rng,
): DeckRunState {
  const index = state.hand.findIndex((c) => c.instanceId === instanceId)
  if (index < 0) return state
  const cardInst = state.hand[index]
  const def = lookupCard(cardInst.cardId)
  if (!def) return state
  const cost = energyCostFor(state, cardInst, def.energyCost)
  if (state.energy < cost) return state

  const hand = state.hand.filter((_, i) => i !== index)
  let next: DeckRunState = {
    ...state,
    hand,
    energy: state.energy - cost,
    discardPile: [...state.discardPile, cardInst],
  }
  next = applyEffects(next, def.effects, rng)
  return { ...next, rngState: rng.state }
}
