import type { DeckRunState } from '@devedesiatky/simulation'

export const DECK_SAVE_KEY = 'devedesiatky.deck.save'
export const DECK_SAVE_VERSION = 1

export type DeckPersistenceStorage = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

export type DeckPersistence = {
  save: (state: DeckRunState) => Promise<void>
  load: () => Promise<DeckRunState | null>
  clear: () => Promise<void>
}

type DeckSaveEnvelope = {
  version: number
  state: DeckRunState
}

export function createDeckMemoryStorage(
  initial: Record<string, string> = {},
): DeckPersistenceStorage {
  const map = new Map(Object.entries(initial))
  return {
    getItem: async (key) => map.get(key) ?? null,
    setItem: async (key, value) => {
      map.set(key, value)
    },
    removeItem: async (key) => {
      map.delete(key)
    },
  }
}

function looksLikeDeckState(value: unknown): value is DeckRunState {
  if (!value || typeof value !== 'object') return false
  const s = value as Record<string, unknown>
  return (
    typeof s.seed === 'number' &&
    typeof s.phase === 'string' &&
    typeof s.quarter === 'number' &&
    Array.isArray(s.hand) &&
    Array.isArray(s.drawPile) &&
    s.resources != null &&
    typeof s.resources === 'object'
  )
}

export function createDeckPersistence(storage: DeckPersistenceStorage): DeckPersistence {
  return {
    async save(state) {
      const envelope: DeckSaveEnvelope = { version: DECK_SAVE_VERSION, state }
      await storage.setItem(DECK_SAVE_KEY, JSON.stringify(envelope))
    },
    async load() {
      try {
        const raw = await storage.getItem(DECK_SAVE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as DeckSaveEnvelope
        if (parsed?.version !== DECK_SAVE_VERSION || !looksLikeDeckState(parsed.state)) {
          return null
        }
        return parsed.state
      } catch {
        return null
      }
    },
    async clear() {
      await storage.removeItem(DECK_SAVE_KEY)
    },
  }
}
