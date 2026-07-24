import { create, type StoreApi, type UseBoundStore } from 'zustand'
import {
  createEmptyDeckLobby,
  createRng,
  reduceDeck,
  type DeckRunState,
} from '@devedesiatky/simulation/deck'
import type {
  AnyPlayableCardId,
  DeckArchetypeId,
  EventChoiceId,
  RelicId,
} from '@devedesiatky/content'
import type { DeckPersistence } from './deckPersistence'

type NewGameResult = { needsConfirmation: true } | { needsConfirmation: false }

type DeckStore = {
  state: DeckRunState
  hasSave: boolean
  hydrated: boolean
  hydrate: () => Promise<void>
  startRun: (input?: { archetypeId?: DeckArchetypeId; seed?: number }) => Promise<void>
  drawHand: () => Promise<void>
  playCard: (instanceId: string) => Promise<void>
  endQuarter: () => Promise<void>
  shopSkip: () => Promise<void>
  openEvent: () => Promise<void>
  openShop: (kind: 'shop-clean' | 'shop-patronage') => Promise<void>
  openRest: () => Promise<void>
  openInstitution: () => Promise<void>
  shopBuy: (cardId: AnyPlayableCardId) => Promise<void>
  takePatronage: (cardId: AnyPlayableCardId) => Promise<void>
  removeCard: (instanceId: string) => Promise<void>
  upgradeCard: (instanceId: string) => Promise<void>
  claimRelic: (relicId: RelicId) => Promise<void>
  resolveEvent: (choiceId: EventChoiceId) => Promise<void>
  bossPlay: (instanceId: string) => Promise<void>
  bossEndTurn: () => Promise<void>
  collectFact: () => Promise<void>
  dismissFact: () => Promise<void>
  newGame: (input: { confirmed: boolean }) => NewGameResult | Promise<NewGameResult>
}

export type DeckStoreApi = UseBoundStore<StoreApi<DeckStore>>

const DURABLE = new Set([
  'START_RUN',
  'DRAW_HAND',
  'PLAY_CARD',
  'END_QUARTER',
  'SHOP_SKIP',
  'OPEN_EVENT',
  'OPEN_SHOP',
  'OPEN_REST',
  'OPEN_INSTITUTION',
  'SHOP_BUY',
  'TAKE_PATRONAGE',
  'REMOVE_CARD',
  'UPGRADE_CARD',
  'CLAIM_RELIC',
  'RESOLVE_EVENT',
  'BOSS_PLAY',
  'BOSS_END_TURN',
  'COLLECT_FACT',
  'DISMISS_FACT',
])

export function createDeckStore(options: {
  persistence: DeckPersistence
  seed?: number
}): DeckStoreApi {
  const { persistence, seed = 1993 } = options

  return create<DeckStore>((set, get) => {
    async function dispatch(action: Parameters<typeof reduceDeck>[1]) {
      const current = get().state
      const rng =
        action.type === 'START_RUN'
          ? createRng(action.seed >>> 0)
          : createRng(current.rngState)
      const next = reduceDeck(current, action, rng)
      set({ state: next })
      if (DURABLE.has(action.type)) {
        await persistence.save(next)
        set({ hasSave: true })
      }
    }

    return {
      state: createEmptyDeckLobby(seed),
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
      startRun: async (input) => {
        await dispatch({
          type: 'START_RUN',
          archetypeId: input?.archetypeId ?? 'stroj-moci',
          seed: input?.seed ?? seed,
        })
        const afterStart = get().state
        const drawn = reduceDeck(
          afterStart,
          { type: 'DRAW_HAND' },
          createRng(afterStart.rngState),
        )
        set({ state: drawn })
        await persistence.save(drawn)
        set({ hasSave: true })
      },
      drawHand: async () => dispatch({ type: 'DRAW_HAND' }),
      playCard: async (instanceId) => dispatch({ type: 'PLAY_CARD', instanceId }),
      endQuarter: async () => dispatch({ type: 'END_QUARTER' }),
      shopSkip: async () => dispatch({ type: 'SHOP_SKIP' }),
      openEvent: async () => dispatch({ type: 'OPEN_EVENT' }),
      openShop: async (kind) => dispatch({ type: 'OPEN_SHOP', kind }),
      openRest: async () => dispatch({ type: 'OPEN_REST' }),
      openInstitution: async () => dispatch({ type: 'OPEN_INSTITUTION' }),
      shopBuy: async (cardId) => dispatch({ type: 'SHOP_BUY', cardId }),
      takePatronage: async (cardId) =>
        dispatch({ type: 'TAKE_PATRONAGE', cardId, sponsorId: 'zelezny-baron' }),
      removeCard: async (instanceId) => dispatch({ type: 'REMOVE_CARD', instanceId }),
      upgradeCard: async (instanceId) => dispatch({ type: 'UPGRADE_CARD', instanceId }),
      claimRelic: async (relicId) => dispatch({ type: 'CLAIM_RELIC', relicId }),
      resolveEvent: async (choiceId) => dispatch({ type: 'RESOLVE_EVENT', choiceId }),
      bossPlay: async (instanceId) => dispatch({ type: 'BOSS_PLAY', instanceId }),
      bossEndTurn: async () => dispatch({ type: 'BOSS_END_TURN' }),
      collectFact: async () => dispatch({ type: 'COLLECT_FACT' }),
      dismissFact: async () => dispatch({ type: 'DISMISS_FACT' }),
      newGame: (input) => {
        if (!input.confirmed && get().hasSave) {
          return { needsConfirmation: true }
        }
        return (async () => {
          await persistence.clear()
          set({
            state: createEmptyDeckLobby(seed),
            hasSave: false,
          })
          return { needsConfirmation: false }
        })()
      },
    }
  })
}
