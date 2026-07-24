import {
  eventIdForQuarter,
  timelineEventsById,
  type EventChoice,
  type EventChoiceId,
  type EventId,
  type FactId,
} from '@devedesiatky/content'
import type { DeckRunState } from './types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function availableDeckEventId(state: DeckRunState): EventId | null {
  const id = eventIdForQuarter(state.year, state.calendarQuarter)
  if (!id || state.resolvedEventIds.includes(id)) return null
  // Election beat is the boss fight, not an acquire event.
  if (id === 'volby-94') return null
  return id
}

export function deckChoicesForEvent(state: DeckRunState): EventChoice[] {
  if (!state.activeEventId) return []
  const event = timelineEventsById[state.activeEventId]
  if (!event) return []
  const role =
    state.govOrOpposition === 'government' ? 'government' : 'opposition'
  return event.choices.filter((c) => c.role === 'both' || c.role === role)
}

export function openDeckEvent(state: DeckRunState): DeckRunState {
  if (state.phase !== 'ACQUIRE') return state
  const eventId = availableDeckEventId(state)
  if (!eventId) return state
  return {
    ...state,
    acquireNode: 'event',
    activeEventId: eventId,
  }
}

export function resolveDeckEvent(
  state: DeckRunState,
  choiceId: EventChoiceId,
): DeckRunState {
  if (state.phase !== 'ACQUIRE' || state.acquireNode !== 'event' || !state.activeEventId) {
    return state
  }
  const event = timelineEventsById[state.activeEventId]
  if (!event) return state
  const choice = deckChoicesForEvent(state).find((c) => c.id === choiceId)
  if (!choice) return state

  const effects = choice.effects
  const resources = { ...state.resources }
  if (effects.preferencie) {
    resources.preferencie = round1(resources.preferencie + effects.preferencie)
  }
  if (effects.reputacia) {
    resources.reputacia = round1(resources.reputacia + effects.reputacia)
  }
  if (effects.koalicia) {
    resources.koalicia = round1(resources.koalicia + effects.koalicia)
  }

  return {
    ...state,
    resources,
    activeEventId: null,
    acquireNode: null,
    resolvedEventIds: [...state.resolvedEventIds, event.id],
    pendingFactId: event.factId,
    phaseAfterFact: 'ACQUIRE',
    phase: 'FACT',
  }
}

export function collectDeckFact(state: DeckRunState): DeckRunState {
  if (state.phase !== 'FACT' || !state.pendingFactId) return state
  const id = state.pendingFactId
  const already = state.collectedFactIds.includes(id)
  return {
    ...state,
    pendingFactId: null,
    collectedFactIds: already ? state.collectedFactIds : [...state.collectedFactIds, id],
    factOpens: state.factOpens + 1,
    phase: state.phaseAfterFact ?? 'ACQUIRE',
    phaseAfterFact: null,
  }
}

export function dismissDeckFact(state: DeckRunState): DeckRunState {
  if (state.phase !== 'FACT') return state
  return {
    ...state,
    pendingFactId: null,
    factOpens: state.factOpens + 1,
    phase: state.phaseAfterFact ?? 'ACQUIRE',
    phaseAfterFact: null,
  }
}

export type { EventChoiceId, EventId, FactId }
