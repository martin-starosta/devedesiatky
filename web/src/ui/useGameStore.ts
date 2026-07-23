import { create } from 'zustand'
import {
  createInitialState,
  createRng,
  reduce,
  type GameState,
} from '../simulation'

type GameStore = {
  state: GameState
  advanceQuarter: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState({ seed: 1993 }),
  advanceQuarter: () => {
    const current = get().state
    const next = reduce(current, { type: 'ADVANCE_QUARTER' }, createRng(current.rngState))
    set({ state: next })
  },
}))
