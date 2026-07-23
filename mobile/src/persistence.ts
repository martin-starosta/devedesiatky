import type { GameState } from '@devedesiatky/simulation'

export const SAVE_KEY = 'devedesiatky.save'
export const SAVE_VERSION = 1

export type PersistenceStorage = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

export type Persistence = {
  save: (state: GameState) => Promise<void>
  load: () => Promise<GameState | null>
  clear: () => Promise<void>
}

type SaveEnvelope = {
  version: number
  state: GameState
}

export function createMemoryStorage(initial: Record<string, string> = {}): PersistenceStorage {
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

export function createPersistence(storage: PersistenceStorage): Persistence {
  return {
    async save(state) {
      const envelope: SaveEnvelope = { version: SAVE_VERSION, state }
      await storage.setItem(SAVE_KEY, JSON.stringify(envelope))
    },
    async load() {
      try {
        const raw = await storage.getItem(SAVE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as SaveEnvelope
        if (parsed?.version !== SAVE_VERSION || !parsed.state || typeof parsed.state !== 'object') {
          return null
        }
        return parsed.state
      } catch {
        return null
      }
    },
    async clear() {
      await storage.removeItem(SAVE_KEY)
    },
  }
}
