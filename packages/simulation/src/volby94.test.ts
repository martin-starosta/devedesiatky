import { describe, expect, it } from 'vitest'
import { MAJORITY_SEATS } from './snem'
import { createInitialState } from './createInitialState'
import { createRng } from './rng'
import { reduce } from './reduce'
import type { GameState } from './types'

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

describe("Voľby '94 boss", () => {
  it('opens staged campaign when 1994 Q3 would fire the election beat', () => {
    let state = createInitialState({
      seed: 94,
      year: 1994,
      quarter: 3,
      preferencie: 12,
      preset: 'hnutie-machine',
    })
    // Skip to event slot the way the turn pipeline does after Peniaze/Politika.
    state = {
      ...state,
      turnPhase: 'centrala',
      resolvedEventIds: state.resolvedEventIds.filter((id) => id !== 'volby-94'),
    }
    state = reduce(state, { type: 'TRY_OPEN_EVENT' }, createRng(state.rngState))

    expect(state.turnPhase).toBe('volby-kampan')
    expect(state.election?.id).toBe('volby-94')
    expect(state.election?.stage).toBe('campaign')
    expect(state.election?.campaignRound).toBe(1)
  })

  it('campaign spends convert pokladňa into regional boost via the reducer', () => {
    let state = atVolbyCampaign()
    const before = state.pokladna

    state = reduce(
      state,
      {
        type: 'CAMPAIGN_SPEND',
        region: 'vychod',
        channel: 'rallies',
        amount: 40_000,
      },
      createRng(state.rngState),
    )

    expect(state.pokladna).toBe(before - 40_000)
    expect(state.election?.boostByRegion.vychod).toBeGreaterThan(0)
    expect(state.election?.totalBoost).toBeGreaterThan(0)
  })

  it('advances campaign → night → resolves needle numbers on FINISH_CAMPAIGN', () => {
    let state = atVolbyCampaign({ preferencie: 18, pokladna: 120_000 })
    state = {
      ...state,
      election: {
        ...state.election!,
        campaignRound: 3,
        totalBoost: 2.5,
        boostByRegion: { zapad: 0.8, stred: 0.7, vychod: 1.0 },
      },
    }

    state = reduce(state, { type: 'FINISH_CAMPAIGN' }, createRng(state.rngState))
    expect(state.turnPhase).toBe('volby-noc')
    expect(state.election?.stage).toBe('night')

    state = reduce(state, { type: 'RESOLVE_ELECTION_NIGHT' }, createRng(state.rngState))
    expect(state.election?.exitPoll).not.toBeNull()
    expect(state.election?.finalShare).not.toBeNull()
    expect(state.preferencie).toBe(state.election?.finalShare)
    expect(state.turnPhase).toBe('volby-noc')
  })

  it('win band reaches coalition then Noc; interior costs more than a normal ministry', () => {
    let state = atVolbyCampaign({
      preferencie: 22,
      pokladna: 50_000,
    })
    state = {
      ...state,
      election: {
        ...state.election!,
        stage: 'night',
        campaignRound: 3,
        totalBoost: 3,
        boostByRegion: { zapad: 1, stred: 1, vychod: 1 },
        exitPoll: 24,
        finalShare: 24,
        won: null,
      },
      turnPhase: 'volby-noc',
      npcParties: state.npcParties.map((npc) => ({
        ...npc,
        preferencie: npc.id === state.mainAntagonistId ? 11 : 8,
        inGovernment: false,
      })),
    }

    state = reduce(state, { type: 'RESOLVE_ELECTION_NIGHT' }, createRng(state.rngState))
    expect(state.election?.won).toBe(true)
    expect(state.turnPhase).toBe('volby-noc')

    state = reduce(state, { type: 'CONTINUE_AFTER_NIGHT' }, createRng(state.rngState))
    expect(state.turnPhase).toBe('volby-koalicia')

    const withInterior = reduce(
      state,
      {
        type: 'OFFER_COALITION',
        partnerId: state.npcParties.find((n) => !n.inGovernment)!.id,
        posts: ['interior'],
      },
      createRng(state.rngState),
    )
    const withCulture = reduce(
      state,
      {
        type: 'OFFER_COALITION',
        partnerId: state.npcParties.find((n) => !n.inGovernment)!.id,
        posts: ['culture'],
      },
      createRng(state.rngState),
    )
    // Interior is prized: culture alone may fail acceptance while interior succeeds,
    // or both succeed but interior yields higher koalicia. Prefer acceptance asymmetry.
    expect(
      withInterior.election?.coalitionPartnerId != null ||
        withInterior.koalicia > withCulture.koalicia,
    ).toBe(true)

    let gov = withInterior.election?.coalitionPartnerId
      ? withInterior
      : reduce(
          state,
          {
            type: 'OFFER_COALITION',
            partnerId: state.npcParties.find((n) => !n.inGovernment)!.id,
            posts: ['interior', 'fnm-chair'],
          },
          createRng(state.rngState),
        )
    expect(gov.election?.coalitionPartnerId).toBeTruthy()

    gov = reduce(gov, { type: 'FINISH_COALITION' }, createRng(gov.rngState))
    expect(gov.turnPhase).toBe('volby-noc-nozo')
    expect(gov.inGovernment).toBe(true)

    const partnerId = gov.election!.coalitionPartnerId!
    gov = reduce(
      gov,
      { type: 'ASSIGN_INSTITUTION', institutionId: 'sis', assigneeId: partnerId },
      createRng(gov.rngState),
    )
    expect(gov.election?.institutions.sis).toBe(partnerId)

    gov = reduce(gov, { type: 'FINISH_NOC_NOZOV' }, createRng(gov.rngState))
    expect(gov.turnPhase === 'fact' || gov.turnPhase === 'centrala').toBe(true)
    expect(gov.election).toBeNull()
  })

  it('loss band flips to opposition and opens hostile Kauzy ledger (fixed seed)', () => {
    let state = createInitialState({
      seed: 94,
      year: 1994,
      quarter: 3,
      preferencie: 6,
      preset: 'hnutie-machine',
    })
    state = {
      ...state,
      turnPhase: 'volby-noc',
      hostileLedger: false,
      kauzy: [
        {
          id: 'k1',
          companyId: 'oceliare-vychod',
          sponsorId: 'zelezny-baron',
          year: 1993,
          quarter: 2,
          pressure: 3,
          conditions: ['lossOfPower'],
          status: 'latent',
        },
      ],
      kauzyPressure: 3,
      election: {
        id: 'volby-94',
        stage: 'night',
        campaignRound: 3,
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
      npcParties: state.npcParties.map((npc) => ({
        ...npc,
        preferencie: npc.id === 'lavica' ? 28 : 12,
        inGovernment: false,
      })),
      mainAntagonistId: 'lavica',
    }

    state = reduce(state, { type: 'RESOLVE_ELECTION_NIGHT' }, createRng(state.rngState))
    expect(state.election?.won).toBe(false)
    state = reduce(state, { type: 'CONTINUE_AFTER_NIGHT' }, createRng(state.rngState))

    expect(state.inGovernment).toBe(false)
    expect(state.hostileLedger).toBe(true)
    expect(state.turnPhase).toBe('centrala')
    expect(state.election).toBeNull()
    expect(state.kauzy.find((k) => k.id === 'k1')?.status).toBe('detonated')
  })

  it('win and loss bands differ for the same seed when preferencie change', () => {
    const seed = 1994
    function nightResult(preferencie: number, foe: number) {
      let state = atVolbyCampaign({ preferencie, seed })
      state = {
        ...state,
        seed,
        turnPhase: 'volby-noc',
        election: {
          ...state.election!,
          stage: 'night',
          campaignRound: 3,
          totalBoost: 0,
          boostByRegion: { zapad: 0, stred: 0, vychod: 0 },
        },
        npcParties: state.npcParties.map((npc, i) => ({
          ...npc,
          preferencie: i === 0 ? foe : 7,
          inGovernment: false,
        })),
        mainAntagonistId: state.npcParties[0].id,
      }
      state = reduce(state, { type: 'RESOLVE_ELECTION_NIGHT' }, createRng(state.rngState))
      return reduce(state, { type: 'CONTINUE_AFTER_NIGHT' }, createRng(state.rngState))
    }

    const win = nightResult(25, 10)
    const loss = nightResult(5, 30)
    expect(win.inGovernment).toBe(true)
    expect(loss.inGovernment).toBe(false)
    expect(loss.hostileLedger).toBe(true)
    expect(win.preferencie).not.toBe(loss.preferencie)
    expect(MAJORITY_SEATS).toBe(76)
  })
})
