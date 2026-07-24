import type { DeckRunState } from './types'

/** Fill fields added after early MVP-A saves so old AsyncStorage blobs keep working. */
export function normalizeDeckRunState(state: DeckRunState): DeckRunState {
  return {
    ...state,
    boss: state.boss ?? null,
    hostileKauzy: state.hostileKauzy ?? false,
    relics: state.relics ?? [],
    pozornost: state.pozornost ?? 0,
    sisExileUsedThisAct: state.sisExileUsedThisAct ?? false,
    restRemovesUsed: state.restRemovesUsed ?? 0,
    armedConditions: state.armedConditions ?? [],
    sponsors: state.sponsors ?? [],
    shopOffers: state.shopOffers ?? null,
    factOpens: state.factOpens ?? 0,
  }
}
