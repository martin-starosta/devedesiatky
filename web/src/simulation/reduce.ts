import type { GameAction, GameState, Quarter, Rng } from './types'

function nextQuarter(year: number, quarter: Quarter): { year: number; quarter: Quarter } {
  if (quarter === 4) {
    return { year: year + 1, quarter: 1 }
  }
  return { year, quarter: (quarter + 1) as Quarter }
}

/**
 * Pure quarterly simulation reducer. UI must never own rules — dispatch actions here.
 * Signature: (state, action, rng) → state
 */
export function reduce(state: GameState, action: GameAction, rng: Rng): GameState {
  switch (action.type) {
    case 'ADVANCE_QUARTER': {
      // Consume one draw so rngState advances even while Preferencie stay stub-stable.
      rng.next()
      const calendar = nextQuarter(state.year, state.quarter)
      return {
        ...state,
        ...calendar,
        rngState: rng.state,
      }
    }
  }
}
