import { create } from 'zustand'
import {
  createBootstrapState,
  createRng,
  reduce,
  type GameState,
  type Ideology,
  type PartyPresetId,
} from '@devedesiatky/simulation'

type GameStore = {
  state: GameState
  foundParty: (input: { ideology?: Ideology; preset?: PartyPresetId }) => void
}

function dispatch(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
  action: Parameters<typeof reduce>[1],
) {
  const current = get().state
  const next = reduce(current, action, createRng(current.rngState))
  set({ state: next })
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createBootstrapState({ seed: 1993 }),
  foundParty: (input) =>
    dispatch(get, set, {
      type: 'FOUND_PARTY',
      ideology: input.ideology,
      preset: input.preset,
    }),
}))
