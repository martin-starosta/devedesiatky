import { create } from 'zustand'
import {
  createBootstrapState,
  createRng,
  reduce,
  type GameState,
  type Ideology,
  type PartyPresetId,
} from '../simulation'

type GameStore = {
  state: GameState
  advanceQuarter: () => void
  foundParty: (input: { ideology?: Ideology; preset?: PartyPresetId }) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createBootstrapState({ seed: 1993 }),
  advanceQuarter: () => {
    const current = get().state
    const next = reduce(current, { type: 'ADVANCE_QUARTER' }, createRng(current.rngState))
    set({ state: next })
  },
  foundParty: (input) => {
    const current = get().state
    const next = reduce(
      current,
      { type: 'FOUND_PARTY', ideology: input.ideology, preset: input.preset },
      createRng(current.rngState),
    )
    set({ state: next })
  },
}))
