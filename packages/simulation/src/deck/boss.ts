import {
  bossAdvantageSupportBonus,
  bossIntentDefs,
  bossIntentOrder,
  bossMaxRounds,
  bossPreferencieFloor,
  bossSupportBase,
  isKauzaCardId,
  pozornostBossSupportPerPoint,
  type BossIntentId,
} from '@devedesiatky/content'
import { drawCards, shuffle } from './draw'
import { armCondition } from './kauzy'
import { effectiveHandSize } from './relics'
import type { BossState, DeckCardInstance, DeckRunState } from './types'
import type { Rng } from '../types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function pickIntent(round: number, rng: Rng): BossIntentId {
  // Mostly sequential for learnability; one rng hop so seed still matters.
  const base = bossIntentOrder[(round - 1) % bossIntentOrder.length]
  if (rng.next() < 0.25) {
    const alt = bossIntentOrder[Math.floor(rng.next() * bossIntentOrder.length)]
    return alt ?? base
  }
  return base
}

function openingSupport(state: DeckRunState): number {
  let support = bossSupportBase
  if (state.bossAdvantage) support += bossAdvantageSupportBonus
  support += Math.floor(state.pozornost) * pozornostBossSupportPerPoint
  return support
}

function drawBossHand(state: DeckRunState, rng: Rng): DeckRunState {
  let discardPile = [...state.discardPile, ...state.hand]
  const result = drawCards(
    state.drawPile,
    discardPile,
    effectiveHandSize(state),
    rng,
  )
  return {
    ...state,
    hand: result.drawn,
    drawPile: result.drawPile,
    discardPile: result.discardPile,
    energy: state.energyMax,
    rngState: rng.state,
  }
}

/** Enter Voľby '94 after Act I Q6 settle / acquire. Consumes bossAdvantage. */
export function enterBoss(state: DeckRunState, rng: Rng): DeckRunState {
  const telegraph = pickIntent(1, rng)
  const boss: BossState = {
    round: 1,
    maxRounds: bossMaxRounds,
    bossSupport: openingSupport(state),
    playerBlock: 0,
    bossBlock: 0,
    telegraph,
    nextSmearBuff: 0,
    outcome: null,
  }
  let next: DeckRunState = {
    ...state,
    phase: 'BOSS',
    acquireNode: null,
    shopOffers: null,
    bossAdvantage: false,
    boss,
    quarterPodpora: 0,
    quarterMobilizacia: 0,
  }
  const combined = shuffle([...next.drawPile, ...next.discardPile, ...next.hand], rng)
  next = {
    ...next,
    drawPile: combined,
    discardPile: [],
    hand: [],
    rngState: rng.state,
  }
  return drawBossHand(next, rng)
}

function applyBossWin(state: DeckRunState): DeckRunState {
  if (!state.boss) return state
  return {
    ...state,
    phase: 'TERMINAL',
    hand: [],
    energy: 0,
    boss: { ...state.boss, outcome: 'win' },
    govOrOpposition: 'government',
  }
}

/** Call after BOSS_PLAY card resolution when support hits 0. */
export function maybeBossWin(state: DeckRunState): DeckRunState {
  if (state.phase !== 'BOSS' || !state.boss || state.boss.outcome) return state
  if (state.boss.bossSupport <= 0) return applyBossWin(state)
  return state
}

function pullLatentKauzyToHand(state: DeckRunState): DeckRunState {
  const isLatentKauza = (c: DeckCardInstance) =>
    isKauzaCardId(c.cardId) && (c.kauzaStatus === 'latent' || c.kauzaStatus === undefined)

  const fromDraw = state.drawPile.filter(isLatentKauza)
  const fromDiscard = state.discardPile.filter(isLatentKauza)
  const pulled = [...fromDraw, ...fromDiscard]
  if (pulled.length === 0) return state
  return {
    ...state,
    hand: [...state.hand, ...pulled],
    drawPile: state.drawPile.filter((c) => !pulled.some((p) => p.instanceId === c.instanceId)),
    discardPile: state.discardPile.filter(
      (c) => !pulled.some((p) => p.instanceId === c.instanceId),
    ),
  }
}

function applyBossLose(state: DeckRunState): DeckRunState {
  if (!state.boss) return state
  let next: DeckRunState = {
    ...state,
    phase: 'TERMINAL',
    energy: 0,
    govOrOpposition: 'opposition',
    hostileKauzy: true,
    boss: { ...state.boss, outcome: 'lose' },
  }
  next = pullLatentKauzyToHand(next)
  next = armCondition(next, 'lossOfPower')
  return next
}

function resolveTelegraph(state: DeckRunState): DeckRunState {
  if (!state.boss) return state
  const intent = state.boss.telegraph
  const def = bossIntentDefs[intent]
  let next = state
  let boss = { ...state.boss }

  if (def.smearDamage != null) {
    const raw = def.smearDamage + boss.nextSmearBuff
    boss = { ...boss, nextSmearBuff: 0 }
    const afterBlock = Math.max(0, raw - boss.playerBlock)
    boss = { ...boss, playerBlock: Math.max(0, boss.playerBlock - raw) }
    next = {
      ...next,
      boss,
      resources: {
        ...next.resources,
        preferencie: round1(next.resources.preferencie - afterBlock),
      },
    }
    boss = next.boss!
  }

  if (def.bossBlockGain != null) {
    boss = { ...boss, bossBlock: boss.bossBlock + def.bossBlockGain }
    next = { ...next, boss }
  }

  if (def.reputaciaHit != null) {
    boss = {
      ...boss,
      nextSmearBuff: boss.nextSmearBuff + (def.nextSmearBuff ?? 0),
    }
    next = {
      ...next,
      boss,
      resources: {
        ...next.resources,
        reputacia: round1(next.resources.reputacia - def.reputaciaHit),
      },
    }
  }

  return next
}

function checkLoseAfterIntent(state: DeckRunState): DeckRunState {
  if (!state.boss || state.boss.outcome) return state
  if (state.resources.preferencie <= bossPreferencieFloor) {
    return applyBossLose(state)
  }
  return state
}

export function bossEndTurn(state: DeckRunState, rng: Rng): DeckRunState {
  if (state.phase !== 'BOSS' || !state.boss || state.boss.outcome) return state

  let next = resolveTelegraph(state)
  next = checkLoseAfterIntent(next)
  if (next.boss?.outcome === 'lose') return next

  const round = (next.boss?.round ?? 1) + 1
  if (round > bossMaxRounds && (next.boss?.bossSupport ?? 0) > 0) {
    return applyBossLose({
      ...next,
      boss: next.boss ? { ...next.boss, round } : next.boss,
    })
  }

  const telegraph = pickIntent(round, rng)
  next = {
    ...next,
    boss: next.boss
      ? {
          ...next.boss,
          round,
          telegraph,
          playerBlock: 0,
        }
      : null,
  }
  return drawBossHand(next, rng)
}
