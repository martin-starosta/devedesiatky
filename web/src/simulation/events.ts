import {
  eventIdForQuarter,
  timelineEventsById,
  type EventChoiceId,
  type EventId,
  type FactId,
} from '../content/timeline'
import { onLostPower } from './kauzy'
import type { GameAction, GameState, Rng } from './types'
import { startVolby94 } from './volby94'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function collapseIfNeeded(state: GameState): GameState {
  if (state.koalicia > 0 || !state.inGovernment) {
    return state
  }
  const collapsed: GameState = {
    ...state,
    inGovernment: false,
    koalicia: 0,
    fnmPool: [...state.fnmPool, ...state.fnmOffered],
    fnmOffered: [],
  }
  return onLostPower(collapsed)
}

export function initialEventFields(): Pick<
  GameState,
  | 'activeEventId'
  | 'pendingFactId'
  | 'collectedFactIds'
  | 'resolvedEventIds'
  | 'patronagePower'
  | 'trustDebt'
> {
  return {
    activeEventId: null,
    pendingFactId: null,
    collectedFactIds: [],
    resolvedEventIds: [],
    patronagePower: 'limited',
    trustDebt: 0,
  }
}

export function openEventOrCentrala(state: GameState): GameState {
  const eventId = eventIdForQuarter(state.year, state.quarter)
  if (eventId === 'volby-94' && !state.resolvedEventIds.includes('volby-94')) {
    return startVolby94(state)
  }
  if (eventId && !state.resolvedEventIds.includes(eventId)) {
    return {
      ...state,
      turnPhase: 'event',
      activeEventId: eventId,
      pendingFactId: null,
    }
  }
  return {
    ...state,
    turnPhase: 'centrala',
    activeEventId: null,
  }
}

export function applyTryOpenEvent(state: GameState): GameState {
  if (state.phase !== 'playing') {
    return state
  }
  return openEventOrCentrala({
    ...state,
    turnPhase: 'centrala',
  })
}

export function applyResolveEvent(
  state: GameState,
  action: Extract<GameAction, { type: 'RESOLVE_EVENT' }>,
  rng: Rng,
): GameState {
  if (state.phase !== 'playing' || state.turnPhase !== 'event' || !state.activeEventId) {
    return state
  }

  const event = timelineEventsById[state.activeEventId as EventId]
  if (!event) {
    return state
  }

  const choice = event.choices.find((row) => row.id === (action.choiceId as EventChoiceId))
  if (!choice) {
    return state
  }
  if (choice.role === 'government' && !state.inGovernment) {
    return state
  }
  if (choice.role === 'opposition' && state.inGovernment) {
    return state
  }

  rng.next()
  const effects = choice.effects
  let next: GameState = {
    ...state,
    preferencie: round1(state.preferencie + (effects.preferencie ?? 0)),
    reputacia: round1(state.reputacia + (effects.reputacia ?? 0)),
    koalicia: round1(state.koalicia + (effects.koalicia ?? 0)),
    trustDebt: state.trustDebt + (effects.trustDebt ?? 0),
    patronagePower: effects.patronagePower ?? state.patronagePower,
    resolvedEventIds: [...state.resolvedEventIds, event.id],
    activeEventId: null,
    pendingFactId: event.factId,
    turnPhase: 'fact',
    rngState: rng.state,
  }

  next = collapseIfNeeded(next)
  if (next.pendingFactId) {
    return { ...next, turnPhase: 'fact' }
  }
  return { ...next, turnPhase: 'centrala' }
}

export function applyCollectFact(state: GameState): GameState {
  if (state.phase !== 'playing' || state.turnPhase !== 'fact' || !state.pendingFactId) {
    return state
  }
  const factId = state.pendingFactId as FactId
  const collected = state.collectedFactIds.includes(factId)
    ? state.collectedFactIds
    : [...state.collectedFactIds, factId]
  return {
    ...state,
    collectedFactIds: collected,
    pendingFactId: null,
    turnPhase: 'centrala',
  }
}

export function applyDismissFact(state: GameState): GameState {
  if (state.phase !== 'playing' || state.turnPhase !== 'fact') {
    return state
  }
  return {
    ...state,
    pendingFactId: null,
    turnPhase: 'centrala',
  }
}

export function choicesForEvent(state: GameState) {
  if (!state.activeEventId) return []
  const event = timelineEventsById[state.activeEventId as EventId]
  if (!event) return []
  return event.choices.filter((choice) => {
    if (choice.role === 'both') return true
    return state.inGovernment ? choice.role === 'government' : choice.role === 'opposition'
  })
}
