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

function dealBossDamage(state: DeckRunState, amount: number): DeckRunState {
  if (!state.boss || amount <= 0) return state
  let remaining = amount
  let bossBlock = state.boss.bossBlock
  if (bossBlock > 0) {
    const absorbed = Math.min(bossBlock, remaining)
    bossBlock -= absorbed
    remaining -= absorbed
  }
  const bossSupport = Math.max(0, state.boss.bossSupport - remaining)
  return {
    ...state,
    boss: { ...state.boss, bossBlock, bossSupport },
  }
}

function addPlayerBlock(state: DeckRunState, amount: number): DeckRunState {
  if (!state.boss || amount <= 0) return state
  return {
    ...state,
    boss: { ...state.boss, playerBlock: state.boss.playerBlock + amount },
  }
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
    case 'addPodpora': {
      if (state.phase === 'BOSS' && state.boss) {
        return dealBossDamage(state, effect.amount)
      }
      return { ...state, quarterPodpora: state.quarterPodpora + effect.amount }
    }
    case 'addMobilizacia': {
      if (state.phase === 'BOSS' && state.boss) {
        return addPlayerBlock(state, effect.amount)
      }
      return {
        ...state,
        quarterMobilizacia: state.quarterMobilizacia + effect.amount,
      }
    }
    case 'addPodporaPer': {
      const amount = effect.amount * statValue(state, effect.stat)
      if (state.phase === 'BOSS' && state.boss) {
        return dealBossDamage(state, amount)
      }
      return {
        ...state,
        quarterPodpora: state.quarterPodpora + amount,
      }
    }
    case 'addMobilizaciaPer': {
      const amount = effect.amount * statValue(state, effect.stat)
      if (state.phase === 'BOSS' && state.boss) {
        return addPlayerBlock(state, amount)
      }
      return {
        ...state,
        quarterMobilizacia: state.quarterMobilizacia + amount,
      }
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
      if (state.phase !== 'BOSS' || !state.boss) return state
      return dealBossDamage(state, effect.amount)
    case 'bossBlock':
      if (state.phase !== 'BOSS' || !state.boss) return state
      return addPlayerBlock(state, effect.amount)
  }
}

export function playCard(
  state: DeckRunState,
  instanceId: string,
  rng: Rng,
): DeckRunState {
  if (state.phase !== 'PLAY' && state.phase !== 'BOSS') return state
  if (state.phase === 'BOSS' && state.boss?.outcome) return state
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
