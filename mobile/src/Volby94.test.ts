import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState } from '@devedesiatky/simulation'
import { createGameStore } from './gameStore'
import { createMemoryStorage, createPersistence } from './persistence'
import type { GameState } from '@devedesiatky/simulation'

function atVolbyCampaign(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState({
    seed: 94,
    year: 1994,
    quarter: 3,
    preferencie: 14,
    preset: 'hnutie-machine',
  })
  return {
    ...base,
    turnPhase: 'volby-kampan',
    pokladna: 200_000,
    election: {
      id: 'volby-94',
      stage: 'campaign',
      campaignRound: 1,
      maxRounds: 3,
      boostByRegion: { zapad: 0, stred: 0, vychod: 0 },
      totalBoost: 0,
      exitPoll: null,
      finalShare: null,
      won: null,
      coalitionPartnerId: null,
      offeredPosts: [],
      acceptedPosts: [],
      institutions: {
        sis: null,
        stv: null,
        fnm: null,
        policia: null,
        justicia: null,
      },
    },
    ...overrides,
  }
}

describe("native Voľby '94", () => {
  const persistence = createPersistence(createMemoryStorage())
  let store = createGameStore({ persistence })

  beforeEach(async () => {
    await persistence.clear()
    store = createGameStore({ persistence })
  })

  it('campaign spend and finishCampaign persist through hydrate', async () => {
    await persistence.save(atVolbyCampaign())
    await store.getState().hydrate()

    const before = store.getState().state.pokladna
    await store.getState().campaignSpend({
      region: 'vychod',
      channel: 'rallies',
      amount: 40_000,
    })
    expect(store.getState().state.pokladna).toBe(before - 40_000)
    expect(store.getState().state.election?.totalBoost).toBeGreaterThan(0)

    // Jump to last round and finish
    const mid = store.getState().state
    await persistence.save({
      ...mid,
      election: { ...mid.election!, campaignRound: 3 },
    })
    store = createGameStore({ persistence })
    await store.getState().hydrate()
    await store.getState().finishCampaign()
    expect(store.getState().state.turnPhase).toBe('volby-noc')
    expect((await persistence.load())?.turnPhase).toBe('volby-noc')
  })

  it('resolves election night and continues', async () => {
    const night = atVolbyCampaign({
      turnPhase: 'volby-noc',
      preferencie: 18,
      election: {
        ...atVolbyCampaign().election!,
        stage: 'night',
        campaignRound: 3,
        totalBoost: 2.5,
        boostByRegion: { zapad: 0.8, stred: 0.7, vychod: 1.0 },
      },
    })
    await persistence.save(night)
    await store.getState().hydrate()

    await store.getState().resolveElectionNight()
    expect(store.getState().state.election?.exitPoll).not.toBeNull()
    expect(store.getState().state.election?.finalShare).not.toBeNull()

    await store.getState().continueAfterNight()
    const phase = store.getState().state.turnPhase
    expect(phase === 'volby-koalicia' || phase === 'centrala' || phase === 'fact').toBe(true)
  })

  it('coalition offer and finish/skip noc persist', async () => {
    const coal = atVolbyCampaign({
      turnPhase: 'volby-koalicia',
      preferencie: 22,
      election: {
        ...atVolbyCampaign().election!,
        stage: 'coalition',
        won: true,
        exitPoll: 20,
        finalShare: 22,
        campaignRound: 3,
        totalBoost: 3,
      },
    })
    await persistence.save(coal)
    await store.getState().hydrate()

    const partnerId = store.getState().state.npcParties[0]?.id
    expect(partnerId).toBeTruthy()
    await store.getState().offerCoalition({
      partnerId: partnerId!,
      posts: ['interior', 'fnm-chair', 'culture', 'economy'],
    })
    // May accept or reject depending on utility — if accepted, finish or skip
    if (store.getState().state.election?.coalitionPartnerId) {
      await store.getState().skipNocNozov()
      expect(store.getState().state.turnPhase).not.toBe('volby-koalicia')
      expect(await persistence.load()).not.toBeNull()
    } else {
      // Still exercised offer path
      expect(store.getState().state.election?.offeredPosts.length).toBeGreaterThan(0)
    }
  })

  it('assigns institutions and finishes noc dlhých nožov', async () => {
    const partnerId = createInitialState({
      seed: 94,
      preferencie: 14,
      preset: 'hnutie-machine',
    }).npcParties[0]!.id

    const noc = atVolbyCampaign({
      turnPhase: 'volby-noc-nozo',
      election: {
        ...atVolbyCampaign().election!,
        stage: 'noc',
        won: true,
        exitPoll: 20,
        finalShare: 22,
        campaignRound: 3,
        coalitionPartnerId: partnerId,
        acceptedPosts: ['interior', 'culture'],
      },
    })
    await persistence.save(noc)
    await store.getState().hydrate()

    await store.getState().assignInstitution({
      institutionId: 'sis',
      assigneeId: 'player',
    })
    expect(store.getState().state.election?.institutions.sis).toBe('player')

    await store.getState().finishNocNozov()
    expect(store.getState().state.turnPhase).not.toBe('volby-noc-nozo')
    expect((await persistence.load())?.turnPhase).not.toBe('volby-noc-nozo')
  })
})
