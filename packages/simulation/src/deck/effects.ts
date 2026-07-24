import { cards, type CardEffect } from '@devedesiatky/content'
import { drawCards } from './draw'
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
      return {
        ...state,
        hand: [...state.hand, ...result.drawn],
        drawPile: result.drawPile,
        discardPile: result.discardPile,
        rngState: rng.state,
      }
    }
    case 'addKauza':
      // Kauza injection lands in a later slice; no-op until #32/#33.
      return state
    case 'bossDamage':
    case 'bossBlock':
      // Boss phase only — no-op in engine quarter.
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
  const def = cards[cardInst.cardId]
  if (!def || state.energy < def.energyCost) return state

  const hand = state.hand.filter((_, i) => i !== index)
  let next: DeckRunState = {
    ...state,
    hand,
    energy: state.energy - def.energyCost,
    discardPile: [...state.discardPile, cardInst],
  }
  next = applyEffects(next, def.effects, rng)
  return { ...next, rngState: rng.state }
}
