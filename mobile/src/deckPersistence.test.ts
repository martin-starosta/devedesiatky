import { describe, expect, it } from 'vitest'
import {
  createEmptyDeckLobby,
  createRng,
  reduceDeck,
} from '@devedesiatky/simulation'
import {
  createDeckMemoryStorage,
  createDeckPersistence,
  DECK_SAVE_KEY,
} from './deckPersistence'

describe('deckPersistence (#31)', () => {
  it('round-trips DeckRunState mid-PLAY and continues reduce', async () => {
    const storage = createDeckMemoryStorage()
    const persistence = createDeckPersistence(storage)

    let state = reduceDeck(
      createEmptyDeckLobby(17),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 17 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))
    expect(state.phase).toBe('PLAY')
    const handIds = state.hand.map((c) => c.instanceId)

    await persistence.save(state)
    const loaded = await persistence.load()
    expect(loaded).not.toBeNull()
    expect(loaded!.phase).toBe('PLAY')
    expect(loaded!.hand.map((c) => c.instanceId)).toEqual(handIds)
    expect(loaded!.quota).toBe(state.quota)
    expect(loaded!.resources.preferencie).toBe(state.resources.preferencie)

    const continued = reduceDeck(
      loaded!,
      { type: 'END_QUARTER' },
      createRng(loaded!.rngState),
    )
    expect(continued.phase).toBe('ACQUIRE')
    expect(continued.lastScore).not.toBeNull()
  })

  it('clear removes only the deck save key', async () => {
    const storage = createDeckMemoryStorage({
      [DECK_SAVE_KEY]: 'x',
      'other.key': 'keep',
    })
    const persistence = createDeckPersistence(storage)
    await persistence.clear()
    expect(await storage.getItem(DECK_SAVE_KEY)).toBeNull()
    expect(await storage.getItem('other.key')).toBe('keep')
  })
})
