import { describe, expect, it } from 'vitest'
import {
  actIOpeningQuota,
  actIQuarterCount,
  actIQuotaGrowthPerQuarter,
  kauzaCardIds,
  quotaMissPreferencieBleed,
} from '@devedesiatky/content'
import { createRng } from '../rng'
import {
  createEmptyDeckLobby,
  quarterScore,
  quotaForQuarter,
  reduceDeck,
} from './reduce'
import { enterBoss } from './boss'
import { countKauzyInRun } from './shop'
import type { DeckRunState } from './types'

function playMitings(state: DeckRunState, count: number): DeckRunState {
  const mitings = state.deck.filter((c) => c.cardId === 'miting').slice(0, count)
  let next: DeckRunState = {
    ...state,
    phase: 'PLAY',
    hand: mitings,
    drawPile: state.deck.filter((c) => !mitings.some((m) => m.instanceId === c.instanceId)),
    discardPile: [],
    energy: count,
    quarterPodpora: 0,
    quarterMobilizacia: 0,
  }
  for (const card of mitings) {
    next = reduceDeck(
      next,
      { type: 'PLAY_CARD', instanceId: card.instanceId },
      createRng(next.rngState),
    )
  }
  return next
}

describe('deck reducer (#27)', () => {
  it('START_RUN builds shuffled deck and DRAW_HAND enters PLAY', () => {
    const lobby = createEmptyDeckLobby(1993)
    const started = reduceDeck(
      lobby,
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 1993 },
      createRng(0),
    )
    expect(started.phase).toBe('DRAW')
    expect(started.deck.length).toBeGreaterThanOrEqual(8)
    expect(started.drawPile.length).toBe(started.deck.length)
    expect(started.quota).toBe(actIOpeningQuota)

    const playing = reduceDeck(started, { type: 'DRAW_HAND' }, createRng(started.rngState))
    expect(playing.phase).toBe('PLAY')
    expect(playing.hand.length).toBe(playing.handSize)
    expect(playing.energy).toBe(playing.energyMax)
    expect(playing.quarterPodpora).toBe(0)
  })

  it('clean stub path clears opening kvóta and banks Preferencie / overkill Pokladňa', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(42),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 42 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))

    const preferencieBefore = state.resources.preferencie
    const pokladnaBefore = state.resources.pokladna
    state = playMitings(state, 3)
    expect(quarterScore(state)).toBe(30)

    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
    expect(state.phase).toBe('ACQUIRE')
    expect(state.lastCleared).toBe(true)
    expect(state.lastScore).toBe(30)
    expect(state.resources.preferencie).toBe(preferencieBefore + 1)
    expect(state.resources.pokladna).toBe(
      pokladnaBefore + (30 - actIOpeningQuota) * 1000,
    )
  })

  it('illegal PLAY_CARD outside PLAY is a no-op', () => {
    const started = reduceDeck(
      createEmptyDeckLobby(1),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 1 },
      createRng(0),
    )
    const next = reduceDeck(
      started,
      { type: 'PLAY_CARD', instanceId: 'nope' },
      createRng(started.rngState),
    )
    expect(next).toEqual(started)
  })
})

describe('deck Act I clock (#28)', () => {
  it('raises kvóta each quarter and walks all 6 into BOSS', () => {
    expect(quotaForQuarter(1)).toBe(actIOpeningQuota)
    expect(quotaForQuarter(2)).toBe(actIOpeningQuota + actIQuotaGrowthPerQuarter)
    expect(quotaForQuarter(6)).toBe(
      actIOpeningQuota + 5 * actIQuotaGrowthPerQuarter,
    )

    let state = reduceDeck(
      createEmptyDeckLobby(99),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 99 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))

    for (let q = 1; q <= actIQuarterCount; q++) {
      expect(state.quarter).toBe(q)
      expect(state.quota).toBe(quotaForQuarter(q))
      state = playMitings(state, 3)
      state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
      if (q < actIQuarterCount) {
        expect(state.phase).toBe('ACQUIRE')
        state = reduceDeck(state, { type: 'SHOP_SKIP' }, createRng(state.rngState))
        expect(state.phase).toBe('PLAY')
      } else {
        expect(state.phase).toBe('BOSS')
      }
    }
    expect(state.year).toBe(1994)
    expect(state.calendarQuarter).toBe(2)
  })

  it('miss bleeds Preferencie; severe miss sets bossAdvantage', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(3),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 3 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))
    const before = state.resources.preferencie
    state = {
      ...state,
      phase: 'PLAY',
      quarterPodpora: 0,
      quarterMobilizacia: 0,
      energy: 0,
    }
    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
    expect(state.lastCleared).toBe(false)
    expect(state.resources.preferencie).toBe(before - quotaMissPreferencieBleed)
    expect(state.bossAdvantage).toBe(true)
  })
})

describe('deck card scaling (#29)', () => {
  it('Regionálna sieť and Kult event scale off offices / kult', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(11),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 11 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))
    const regional = state.deck.find((c) => c.cardId === 'regionalna-siet')
    const kult = state.deck.find((c) => c.cardId === 'kult-event')
    expect(regional && kult).toBeTruthy()
    state = {
      ...state,
      phase: 'PLAY',
      hand: [regional!, kult!],
      energy: 2,
      quarterPodpora: 0,
      quarterMobilizacia: 0,
      resources: { ...state.resources, offices: 3, kult: 2 },
    }
    state = reduceDeck(
      state,
      { type: 'PLAY_CARD', instanceId: regional!.instanceId },
      createRng(state.rngState),
    )
    expect(state.quarterPodpora).toBe(6) // 2 per office × 3
    state = reduceDeck(
      state,
      { type: 'PLAY_CARD', instanceId: kult!.instanceId },
      createRng(state.rngState),
    )
    expect(state.quarterPodpora).toBe(12) // +3 per kult × 2
  })
})

describe('deck events + facts (#30)', () => {
  it('OPEN_EVENT → RESOLVE_EVENT → COLLECT_FACT on 1993 Q1', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(1),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 1 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))
    state = playMitings(state, 3)
    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
    expect(state.phase).toBe('ACQUIRE')
    expect(state.year).toBe(1993)
    expect(state.calendarQuarter).toBe(1)

    const beforePref = state.resources.preferencie
    state = reduceDeck(state, { type: 'OPEN_EVENT' }, createRng(state.rngState))
    expect(state.activeEventId).toBe('vznik-republiky')
    expect(state.acquireNode).toBe('event')

    state = reduceDeck(
      state,
      { type: 'RESOLVE_EVENT', choiceId: 'celebrate' },
      createRng(state.rngState),
    )
    expect(state.phase).toBe('FACT')
    expect(state.pendingFactId).toBe('fact-vznik-republiky')
    expect(state.resolvedEventIds).toContain('vznik-republiky')
    expect(state.resources.preferencie).toBeGreaterThan(beforePref)

    state = reduceDeck(state, { type: 'COLLECT_FACT' }, createRng(state.rngState))
    expect(state.phase).toBe('ACQUIRE')
    expect(state.collectedFactIds).toContain('fact-vznik-republiky')
    expect(state.factOpens).toBe(1)
    expect(state.pendingFactId).toBeNull()
  })
})

describe('deck acquisition shops (#32)', () => {
  it('clean shop adds card without kauzy; patronage injects kauzy + obligation', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(21),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 21 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))
    state = playMitings(state, 3)
    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))

    state = reduceDeck(
      state,
      { type: 'OPEN_SHOP', kind: 'shop-clean' },
      createRng(state.rngState),
    )
    expect(state.acquireNode).toBe('shop-clean')
    expect(state.shopOffers?.length).toBeGreaterThan(0)
    const cleanCard = state.shopOffers![0]
    const beforeCleanKauzy = countKauzyInRun(state)
    state = reduceDeck(
      state,
      { type: 'SHOP_BUY', cardId: cleanCard },
      createRng(state.rngState),
    )
    expect(countKauzyInRun(state)).toBe(beforeCleanKauzy)
    expect(state.deck.some((c) => c.cardId === cleanCard)).toBe(true)

    // Next quarter acquire → patronage
    state = reduceDeck(state, { type: 'SHOP_SKIP' }, createRng(state.rngState))
    state = playMitings(state, 3)
    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
    state = reduceDeck(
      state,
      { type: 'OPEN_SHOP', kind: 'shop-patronage' },
      createRng(state.rngState),
    )
    const patCard = state.shopOffers![0]
    const beforePat = countKauzyInRun(state)
    state = reduceDeck(
      state,
      { type: 'TAKE_PATRONAGE', cardId: patCard, sponsorId: 'zelezny-baron' },
      createRng(state.rngState),
    )
    expect(countKauzyInRun(state)).toBeGreaterThan(beforePat)
    expect(state.sponsors.some((s) => s.sponsorId === 'zelezny-baron' && s.obligations >= 1)).toBe(
      true,
    )
  })
})

describe('deck kauzy (#33)', () => {
  it('detonates kauza in hand when condition is armed; mute spends Reputácia', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(5),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 5 },
      createRng(0),
    )
    const kauza = {
      instanceId: 'k1',
      cardId: 'kauza-novinar' as const,
      kauzaStatus: 'latent' as const,
    }
    state = {
      ...state,
      phase: 'PLAY',
      hand: [kauza],
      deck: [...state.deck, kauza],
      energy: 1,
      resources: { ...state.resources, media: 0, preferencie: 10, reputacia: 5 },
    }
    state = reduceDeck(
      state,
      { type: 'ARM_CONDITION', condition: 'journalist' },
      createRng(state.rngState),
    )
    expect(
      state.hand.find((c) => c.instanceId === 'k1')?.kauzaStatus === 'nevymazatelna' ||
        state.deck.find((c) => c.instanceId === 'k1')?.kauzaStatus === 'nevymazatelna',
    ).toBe(true)

    const tunel = {
      instanceId: 'k2',
      cardId: 'kauza-tunel' as const,
      kauzaStatus: 'latent' as const,
    }
    state = {
      ...state,
      hand: [tunel],
      deck: [...state.deck, tunel],
      armedConditions: [],
      resources: { ...state.resources, media: 6, preferencie: 10, reputacia: 5 },
    }
    const prefBeforeMute = state.resources.preferencie
    const repBefore = state.resources.reputacia
    state = reduceDeck(
      state,
      { type: 'ARM_CONDITION', condition: 'journalist' },
      createRng(state.rngState),
    )
    expect(state.hand.find((c) => c.instanceId === 'k2')?.kauzaStatus).toBe('muted')
    expect(state.resources.preferencie).toBeLessThan(prefBeforeMute)
    expect(state.resources.reputacia).toBeLessThan(repBefore)
  })

  it('kauzy-choked deck fails a late Act I kvóta', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(8),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 8 },
      createRng(0),
    )
    const curses = kauzaCardIds.slice(0, 5).map((id, i) => ({
      instanceId: `clog${i}`,
      cardId: id,
      kauzaStatus: 'latent' as const,
    }))
    state = {
      ...state,
      phase: 'PLAY',
      quarter: 6,
      quota: quotaForQuarter(6),
      hand: curses,
      deck: [...state.deck, ...curses],
      energy: 3,
      quarterPodpora: 0,
      quarterMobilizacia: 0,
    }
    for (const c of curses.slice(0, 3)) {
      state = reduceDeck(
        state,
        { type: 'PLAY_CARD', instanceId: c.instanceId },
        createRng(state.rngState),
      )
    }
    expect(quarterScore(state)).toBe(0)
    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
    expect(state.lastCleared).toBe(false)
    expect(state.phase).toBe('BOSS')
    // Severe miss feeds bossAdvantage into opening bossSupport (then flag is consumed).
    expect(state.boss?.bossSupport).toBeGreaterThanOrEqual(50)
  })
})

describe('deck relics + rest (#34)', () => {
  it('claims STV and Ústavná väčšina; rest can remove a card', () => {
    let state = reduceDeck(
      createEmptyDeckLobby(34),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed: 34 },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))
    state = playMitings(state, 3)
    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))

    state = reduceDeck(state, { type: 'OPEN_INSTITUTION' }, createRng(state.rngState))
    const mediaBefore = state.resources.media
    state = reduceDeck(
      state,
      { type: 'CLAIM_RELIC', relicId: 'statna-tv' },
      createRng(state.rngState),
    )
    expect(state.relics).toContain('statna-tv')
    expect(state.resources.media).toBe(mediaBefore + 1)

    state = reduceDeck(state, { type: 'SHOP_SKIP' }, createRng(state.rngState))
    state = playMitings(state, 3)
    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
    state = reduceDeck(state, { type: 'OPEN_INSTITUTION' }, createRng(state.rngState))
    state = reduceDeck(
      state,
      { type: 'CLAIM_RELIC', relicId: 'ustavna-vacina' },
      createRng(state.rngState),
    )
    expect(state.handSize).toBe(6)

    state = reduceDeck(state, { type: 'SHOP_SKIP' }, createRng(state.rngState))
    state = playMitings(state, 3)
    state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
    const target = state.discardPile[0] ?? state.drawPile[0]
    expect(target).toBeTruthy()
    state = reduceDeck(state, { type: 'OPEN_REST' }, createRng(state.rngState))
    const deckBefore = state.deck.length
    state = reduceDeck(
      state,
      { type: 'REMOVE_CARD', instanceId: target!.instanceId },
      createRng(state.rngState),
    )
    expect(state.deck.length).toBe(deckBefore - 1)
    expect(state.restRemovesUsed).toBe(1)
  })
})

describe('deck Voľby ’94 boss (#35)', () => {
  function reachBoss(seed: number, opts?: { advantage?: boolean; pozornost?: number }) {
    let state = reduceDeck(
      createEmptyDeckLobby(seed),
      { type: 'START_RUN', archetypeId: 'stroj-moci', seed },
      createRng(0),
    )
    state = reduceDeck(state, { type: 'DRAW_HAND' }, createRng(state.rngState))
    for (let q = 1; q <= actIQuarterCount; q++) {
      state = playMitings(state, 3)
      state = reduceDeck(state, { type: 'END_QUARTER' }, createRng(state.rngState))
      if (q < actIQuarterCount) {
        state = reduceDeck(state, { type: 'SHOP_SKIP' }, createRng(state.rngState))
      }
    }
    if (opts?.advantage || opts?.pozornost != null) {
      // Re-enter with forced modifiers for difficulty fixtures.
      state = {
        ...state,
        bossAdvantage: opts.advantage ?? false,
        pozornost: opts.pozornost ?? state.pozornost,
        boss: null,
        phase: 'BOSS',
      }
      state = enterBoss(state, createRng(state.rngState))
    }
    return state
  }

  it('enters BOSS with telegraphed intent after Q6', () => {
    const state = reachBoss(77)
    expect(state.phase).toBe('BOSS')
    expect(state.boss).toBeTruthy()
    expect(state.boss!.bossSupport).toBe(40)
    expect(state.boss!.telegraph).toBeTruthy()
    expect(state.hand.length).toBeGreaterThan(0)
  })

  it('bossAdvantage and Pozornosť raise opening bossSupport', () => {
    const base = reachBoss(78)
    const hard = reachBoss(78, { advantage: true, pozornost: 3 })
    expect(hard.boss!.bossSupport).toBe(base.boss!.bossSupport + 10 + 6)
  })

  it('win path keeps government when bossSupport hits 0', () => {
    let state = reachBoss(80)
    state = {
      ...state,
      boss: state.boss
        ? { ...state.boss, bossSupport: 5, bossBlock: 0, playerBlock: 0 }
        : null,
      hand: state.deck.filter((c) => c.cardId === 'miting').slice(0, 1),
      energy: 3,
    }
    const card = state.hand[0]
    expect(card).toBeTruthy()
    state = reduceDeck(
      state,
      { type: 'BOSS_PLAY', instanceId: card!.instanceId },
      createRng(state.rngState),
    )
    expect(state.boss?.bossSupport).toBe(0)
    expect(state.phase).toBe('TERMINAL')
    expect(state.boss?.outcome).toBe('win')
    expect(state.govOrOpposition).toBe('government')
  })

  it('lose path flips to opposition and weaponizes kauzy', () => {
    let state = reachBoss(81)
    const kauzaId = kauzaCardIds[0]
    const kauzaInst = {
      instanceId: 'kx-boss',
      cardId: kauzaId,
      kauzaStatus: 'latent' as const,
    }
    state = {
      ...state,
      resources: { ...state.resources, preferencie: 6, media: 99 },
      discardPile: [...state.discardPile, kauzaInst],
      deck: [...state.deck, kauzaInst],
      boss: state.boss
        ? { ...state.boss, telegraph: 'smear', nextSmearBuff: 0, playerBlock: 0 }
        : null,
    }
    state = reduceDeck(state, { type: 'BOSS_END_TURN' }, createRng(state.rngState))
    expect(state.phase).toBe('TERMINAL')
    expect(state.boss?.outcome).toBe('lose')
    expect(state.govOrOpposition).toBe('opposition')
    expect(state.hostileKauzy).toBe(true)
    expect(state.armedConditions).toContain('lossOfPower')
  })

  it('same seed replays the same telegraph sequence', () => {
    const a = reachBoss(91)
    const b = reachBoss(91)
    expect(a.boss?.telegraph).toBe(b.boss?.telegraph)
    const a2 = reduceDeck(a, { type: 'BOSS_END_TURN' }, createRng(a.rngState))
    const b2 = reduceDeck(b, { type: 'BOSS_END_TURN' }, createRng(b.rngState))
    expect(a2.boss?.telegraph).toBe(b2.boss?.telegraph)
    expect(a2.boss?.round).toBe(b2.boss?.round)
  })
})
