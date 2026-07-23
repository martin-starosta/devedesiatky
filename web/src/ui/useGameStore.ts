import { create } from 'zustand'
import {
  createBootstrapState,
  createRng,
  reduce,
  type CompanyId,
  type EventChoiceId,
  type FnmDestination,
  type GameState,
  type Ideology,
  type PartyPresetId,
  type PolitikaActionId,
} from '../simulation'

type GameStore = {
  state: GameState
  advanceQuarter: () => void
  foundParty: (input: { ideology?: Ideology; preset?: PartyPresetId }) => void
  spendPolitika: (actionId: PolitikaActionId) => void
  finishPolitika: () => void
  assignFnm: (companyId: CompanyId, destination: FnmDestination) => void
  finishPeniaze: () => void
  resolveEvent: (choiceId: EventChoiceId) => void
  collectFact: () => void
  dismissFact: () => void
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
  advanceQuarter: () => dispatch(get, set, { type: 'ADVANCE_QUARTER' }),
  foundParty: (input) =>
    dispatch(get, set, {
      type: 'FOUND_PARTY',
      ideology: input.ideology,
      preset: input.preset,
    }),
  spendPolitika: (actionId) => dispatch(get, set, { type: 'SPEND_POLITIKA', actionId }),
  finishPolitika: () => dispatch(get, set, { type: 'FINISH_POLITIKA' }),
  assignFnm: (companyId, destination) =>
    dispatch(get, set, { type: 'ASSIGN_FNM', companyId, destination }),
  finishPeniaze: () => dispatch(get, set, { type: 'FINISH_PENIAZE' }),
  resolveEvent: (choiceId) => dispatch(get, set, { type: 'RESOLVE_EVENT', choiceId }),
  collectFact: () => dispatch(get, set, { type: 'COLLECT_FACT' }),
  dismissFact: () => dispatch(get, set, { type: 'DISMISS_FACT' }),
}))
