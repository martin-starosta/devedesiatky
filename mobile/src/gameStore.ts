import { create, type StoreApi, type UseBoundStore } from 'zustand'
import {
  createBootstrapState,
  createRng,
  reduce,
  type GameState,
  type Ideology,
  type PartyPresetId,
} from '@devedesiatky/simulation'
import type { Persistence } from './persistence'

type NewGameResult = { needsConfirmation: true } | { needsConfirmation: false }

type GameStore = {
  state: GameState
  hasSave: boolean
  hydrated: boolean
  hydrate: () => Promise<void>
  foundParty: (input: { ideology?: Ideology; preset?: PartyPresetId }) => Promise<void>
  newGame: (input: { confirmed: boolean }) => NewGameResult | Promise<NewGameResult>
}

export type GameStoreApi = UseBoundStore<StoreApi<GameStore>>

const DURABLE_ACTIONS = new Set([
  'FOUND_PARTY',
  'FINISH_POLITIKA',
  'FINISH_PENIAZE',
  'RESOLVE_EVENT',
  'ADVANCE_QUARTER',
])

export function createGameStore(options: { persistence: Persistence; seed?: number }): GameStoreApi {
  const { persistence, seed = 1993 } = options

  return create<GameStore>((set, get) => {
    async function dispatch(action: Parameters<typeof reduce>[1]) {
      const current = get().state
      const next = reduce(current, action, createRng(current.rngState))
      set({ state: next })
      if (DURABLE_ACTIONS.has(action.type)) {
        await persistence.save(next)
        set({ hasSave: true })
      }
    }

    return {
      state: createBootstrapState({ seed }),
      hasSave: false,
      hydrated: false,
      hydrate: async () => {
        const saved = await persistence.load()
        if (saved) {
          set({ state: saved, hasSave: true, hydrated: true })
          return
        }
        set({ hasSave: false, hydrated: true })
      },
      foundParty: async (input) => {
        await dispatch({
          type: 'FOUND_PARTY',
          ideology: input.ideology,
          preset: input.preset,
        })
      },
      newGame: (input) => {
        if (get().hasSave && !input.confirmed) {
          return { needsConfirmation: true }
        }
        return (async () => {
          await persistence.clear()
          set({
            state: createBootstrapState({ seed }),
            hasSave: false,
          })
          return { needsConfirmation: false }
        })()
      },
    }
  })
}
