import {
  cleanShopCardIds,
  cleanShopPrice,
  isKauzaCardId,
  kauzaCardIds,
  lookupCard,
  patronageKauzaInjectMax,
  patronageKauzaInjectMin,
  patronageShopCardIds,
  patronageShopPrice,
  shopOfferCount,
  sponsors,
  type AnyPlayableCardId,
  type SponsorId,
} from '@devedesiatky/content'
import { shuffle } from './draw'
import type { DeckCardInstance, DeckRunState, SponsorDebt } from './types'
import type { Rng } from '../types'

function mintInstance(
  state: DeckRunState,
  cardId: AnyPlayableCardId,
): { state: DeckRunState; card: DeckCardInstance } {
  const instanceId = `c${state.nextInstanceSeq}`
  const card = { instanceId, cardId }
  return {
    state: {
      ...state,
      nextInstanceSeq: state.nextInstanceSeq + 1,
      deck: [...state.deck, card],
    },
    card,
  }
}

function pickOffers(pool: AnyPlayableCardId[], count: number, rng: Rng): AnyPlayableCardId[] {
  const shuffled = shuffle([...pool], rng)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function openShop(
  state: DeckRunState,
  kind: 'shop-clean' | 'shop-patronage',
  rng: Rng,
): DeckRunState {
  if (state.phase !== 'ACQUIRE') return state
  if (state.acquireNode === 'event' && state.activeEventId) return state
  const pool = kind === 'shop-clean' ? cleanShopCardIds : patronageShopCardIds
  const offers = pickOffers(pool, shopOfferCount, rng)
  return {
    ...state,
    acquireNode: kind,
    shopOffers: offers,
    rngState: rng.state,
  }
}

function addObligation(sponsorsList: SponsorDebt[], sponsorId: SponsorId): SponsorDebt[] {
  const existing = sponsorsList.find((s) => s.sponsorId === sponsorId)
  if (existing) {
    return sponsorsList.map((s) =>
      s.sponsorId === sponsorId ? { ...s, obligations: s.obligations + 1 } : s,
    )
  }
  return [...sponsorsList, { sponsorId, obligations: 1 }]
}

function injectKauzy(state: DeckRunState, count: number, rng: Rng): DeckRunState {
  let next = state
  const picks = shuffle([...kauzaCardIds], rng).slice(0, count)
  const added: DeckCardInstance[] = []
  for (const kauzaId of picks) {
    const minted = mintInstance(next, kauzaId)
    next = {
      ...minted.state,
      deck: minted.state.deck.map((c) =>
        c.instanceId === minted.card.instanceId
          ? { ...c, kauzaStatus: 'latent' as const }
          : c,
      ),
    }
    added.push({ ...minted.card, kauzaStatus: 'latent' })
  }
  return {
    ...next,
    discardPile: [...next.discardPile, ...added],
    rngState: rng.state,
  }
}

/** Clean shop purchase — no kauzy. Completes the acquire node (advance via SHOP_SKIP). */
export function shopBuy(
  state: DeckRunState,
  cardId: AnyPlayableCardId,
  rng: Rng,
): DeckRunState {
  if (state.phase !== 'ACQUIRE' || state.acquireNode !== 'shop-clean') return state
  if (!state.shopOffers?.includes(cardId)) return state
  if (isKauzaCardId(cardId)) return state
  const def = lookupCard(cardId)
  if (!def) return state
  if (state.resources.pokladna < cleanShopPrice) return state

  const minted = mintInstance(state, cardId)
  return {
    ...minted.state,
    resources: {
      ...minted.state.resources,
      pokladna: minted.state.resources.pokladna - cleanShopPrice,
    },
    discardPile: [...minted.state.discardPile, minted.card],
    shopOffers: null,
    acquireNode: 'skip',
    rngState: rng.state,
  }
}

/** Patronage purchase — cheaper card + kauzy + obligation. */
export function takePatronage(
  state: DeckRunState,
  cardId: AnyPlayableCardId,
  rng: Rng,
  sponsorId: SponsorId = 'zelezny-baron',
): DeckRunState {
  if (state.phase !== 'ACQUIRE' || state.acquireNode !== 'shop-patronage') return state
  if (!state.shopOffers?.includes(cardId)) return state
  if (isKauzaCardId(cardId)) return state
  if (!(sponsorId in sponsors)) return state
  if (state.resources.pokladna < patronageShopPrice) return state

  const minted = mintInstance(state, cardId)
  let next: DeckRunState = {
    ...minted.state,
    resources: {
      ...minted.state.resources,
      pokladna: minted.state.resources.pokladna - patronageShopPrice,
    },
    discardPile: [...minted.state.discardPile, minted.card],
    sponsors: addObligation(minted.state.sponsors, sponsorId),
  }

  const span = patronageKauzaInjectMax - patronageKauzaInjectMin + 1
  const kauzaCount =
    patronageKauzaInjectMin + Math.floor(rng.next() * span)
  next = injectKauzy(next, kauzaCount, rng)

  return {
    ...next,
    shopOffers: null,
    acquireNode: 'skip',
    rngState: rng.state,
  }
}

export function countKauzyInRun(state: DeckRunState): number {
  return state.deck.filter((c) => isKauzaCardId(c.cardId)).length
}
