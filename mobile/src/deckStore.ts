import { create, type StoreApi, type UseBoundStore } from 'zustand'
import {
  createEmptyDeckLobby,
  createRng,
  reduceDeck,
  type DeckRunState,
} from '@devedesiatky/simulation'
import type { DeckArchetypeId, EventChoiceId } from '@devedesiatky/content'

type DeckStore = {
  state: DeckRunState
  startRun: (input?: { archetypeId?: DeckArchetypeId; seed?: number }) => void
  drawHand: () => void
  playCard: (instanceId: string) => void
  endQuarter: () => void
  shopSkip: () => void
  openEvent: () => void
  resolveEvent: (choiceId: EventChoiceId) => void
  collectFact: () => void
  dismissFact: () => void
}

export type DeckStoreApi = UseBoundStore<StoreApi<DeckStore>>

export function createDeckStore(options: { seed?: number } = {}): DeckStoreApi {
  const seed = options.seed ?? 1993

  return create<DeckStore>((set, get) => {
    function dispatch(action: Parameters<typeof reduceDeck>[1]) {
      const current = get().state
      const rng =
        action.type === 'START_RUN'
          ? createRng(action.seed >>> 0)
          : createRng(current.rngState)
      set({ state: reduceDeck(current, action, rng) })
    }

    return {
      state: createEmptyDeckLobby(seed),
      startRun: (input) => {
        dispatch({
          type: 'START_RUN',
          archetypeId: input?.archetypeId ?? 'stroj-moci',
          seed: input?.seed ?? seed,
        })
        const afterStart = get().state
        set({
          state: reduceDeck(afterStart, { type: 'DRAW_HAND' }, createRng(afterStart.rngState)),
        })
      },
      drawHand: () => dispatch({ type: 'DRAW_HAND' }),
      playCard: (instanceId) => dispatch({ type: 'PLAY_CARD', instanceId }),
      endQuarter: () => dispatch({ type: 'END_QUARTER' }),
      shopSkip: () => dispatch({ type: 'SHOP_SKIP' }),
      openEvent: () => dispatch({ type: 'OPEN_EVENT' }),
      resolveEvent: (choiceId) => dispatch({ type: 'RESOLVE_EVENT', choiceId }),
      collectFact: () => dispatch({ type: 'COLLECT_FACT' }),
      dismissFact: () => dispatch({ type: 'DISMISS_FACT' }),
    }
  })
}
