import { create } from 'zustand'
import {
  createBootstrapState,
  createRng,
  reduce,
  type CompanyId,
  type GameState,
  type Ideology,
  type PartyPresetId,
  type SponsorId,
} from '../simulation'

type GameStore = {
  state: GameState
  advanceQuarter: () => void
  foundParty: (input: { ideology?: Ideology; preset?: PartyPresetId }) => void
  assignToSponsor: (companyId: CompanyId, sponsorId: SponsorId) => void
  finishPeniaze: () => void
}

function dispatch(get: () => GameStore, set: (partial: Partial<GameStore>) => void, action: Parameters<typeof reduce>[1]) {
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
  assignToSponsor: (companyId, sponsorId) =>
    dispatch(get, set, { type: 'ASSIGN_TO_SPONSOR', companyId, sponsorId }),
  finishPeniaze: () => dispatch(get, set, { type: 'FINISH_PENIAZE' }),
}))
