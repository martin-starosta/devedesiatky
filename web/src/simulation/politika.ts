import {
  politikaActions,
  politikaApBand,
  startingMedia,
  startingReputacia,
  type PolitikaActionId,
} from '../content/politika'
import { openEventOrCentrala } from './events'
import { openPeniazePhase } from './patronage'
import type { GameAction, GameState, Rng } from './types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function rollActionPoints(rng: Rng): number {
  const span = politikaApBand.max - politikaApBand.min + 1
  return politikaApBand.min + Math.floor(rng.next() * span)
}

export function openPolitikaPhase(state: GameState, rng: Rng): GameState {
  if (state.phase !== 'playing') {
    return state
  }
  return {
    ...state,
    turnPhase: 'politika',
    actionPoints: rollActionPoints(rng),
    rngState: rng.state,
  }
}

export function applySpendPolitika(
  state: GameState,
  action: Extract<GameAction, { type: 'SPEND_POLITIKA' }>,
  rng: Rng,
): GameState {
  if (state.phase !== 'playing' || state.turnPhase !== 'politika' || state.actionPoints <= 0) {
    return state
  }

  const def = politikaActions[action.actionId as PolitikaActionId]
  if (!def) {
    return state
  }
  if (def.role === 'government' && !state.inGovernment) {
    return state
  }
  if (def.role === 'opposition' && state.inGovernment) {
    return state
  }

  rng.next()
  const effects = def.effects
  let next: GameState = {
    ...state,
    actionPoints: state.actionPoints - 1,
    preferencie: round1(state.preferencie + (effects.preferencie ?? 0)),
    reputacia: round1(state.reputacia + (effects.reputacia ?? 0)),
    media: round1(state.media + (effects.media ?? 0)),
    rngState: rng.state,
  }

  if (next.actionPoints === 0) {
    return applyFinishPolitika(next, rng)
  }
  return next
}

/** End Politika; government opens Peniaze, opposition returns to Centrála. */
export function applyFinishPolitika(state: GameState, rng: Rng): GameState {
  if (state.phase !== 'playing' || state.turnPhase !== 'politika') {
    return state
  }
  const cleared: GameState = {
    ...state,
    actionPoints: 0,
  }
  if (state.inGovernment) {
    return openPeniazePhase(cleared, rng)
  }
  return openEventOrCentrala({
    ...cleared,
    rngState: rng.state,
  })
}

export function initialPolitikaFields(): Pick<
  GameState,
  'reputacia' | 'media' | 'actionPoints'
> {
  return {
    reputacia: startingReputacia,
    media: startingMedia,
    actionPoints: 0,
  }
}

export function availablePolitikaActions(inGovernment: boolean): PolitikaActionId[] {
  return (Object.keys(politikaActions) as PolitikaActionId[]).filter((id) => {
    const role = politikaActions[id].role
    if (role === 'both') return true
    return inGovernment ? role === 'government' : role === 'opposition'
  })
}
