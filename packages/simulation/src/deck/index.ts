/** Deck-run surface — import from `@devedesiatky/simulation/deck` to avoid the v2 barrel. */

export type {
  AcquireNode,
  BossState,
  DeckAction,
  DeckCardInstance,
  DeckPhase,
  DeckResources,
  DeckRunState,
} from './types'
export {
  createEmptyDeckLobby,
  quarterScore,
  quotaForQuarter,
  reduceDeck,
} from './reduce'
export {
  availableDeckEventId,
  deckChoicesForEvent,
} from './events'
export { countKauzyInRun } from './shop'
export { normalizeDeckRunState } from './normalize'
export { createRng } from '../rng'
export type { Rng } from '../types'
