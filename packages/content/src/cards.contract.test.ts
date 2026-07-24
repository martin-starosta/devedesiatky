import { describe, expect, it } from 'vitest'
import {
  actICardIds,
  actIOpeningQuota,
  cards,
  cleanShopCardIds,
  deckArchetypes,
  patronageShopCardIds,
  type CardEffect,
  type CardId,
} from './cards'

function slovenskoIndexDelta(cardId: CardId): number {
  return cards[cardId].effects.reduce(
    (sum, e) =>
      e.type === 'gainResource' && e.resource === 'slovenskoIndex' ? sum + e.amount : sum,
    0,
  )
}

const EFFECT_TYPES = new Set([
  'addPodpora',
  'addMobilizacia',
  'addPodporaPer',
  'addMobilizaciaPer',
  'gainResource',
  'gainEnergy',
  'draw',
  'addKauza',
  'bossDamage',
  'bossBlock',
])

function assertEffect(effect: CardEffect) {
  expect(EFFECT_TYPES.has(effect.type)).toBe(true)
}

describe('card content contracts', () => {
  it('resolves every Act I card id and closed effects', () => {
    expect(actICardIds.length).toBeGreaterThanOrEqual(20)
    for (const card of Object.values(cards)) {
      expect(cards[card.id]).toBe(card)
      expect(card.titleSk.length).toBeGreaterThan(0)
      expect(card.energyCost).toBeGreaterThanOrEqual(0)
      for (const effect of card.effects) {
        assertEffect(effect)
      }
    }
  })

  it('resolves archetype starting-deck and patronage pool card ids', () => {
    expect(actIOpeningQuota).toBeGreaterThan(0)
    for (const archetype of Object.values(deckArchetypes)) {
      expect(archetype.startingDeck.length).toBeGreaterThanOrEqual(8)
      for (const id of archetype.startingDeck) {
        expect(cards[id as CardId]).toBeDefined()
      }
    }
    for (const id of patronageShopCardIds) {
      expect(cards[id].tags).toContain('patronage')
    }
    // Thesis temptation: patronage galavečer outscores basic míting Podpora.
    const gala = cards['sponzor-galavecer'].effects.find((e) => e.type === 'addPodpora')
    const miting = cards.miting.effects.find((e) => e.type === 'addPodpora')
    expect(gala && miting && gala.type === 'addPodpora' && miting.type === 'addPodpora').toBe(true)
    if (gala?.type === 'addPodpora' && miting?.type === 'addPodpora') {
      expect(gala.amount).toBeGreaterThan(miting.amount)
    }
  })

  it('divoká privatizácia thesis: patronage tanks the country, clean tenders lift it', () => {
    // Every patronage-pool card pushes the Slovensko index down.
    for (const id of patronageShopCardIds) {
      expect(cards[id].tags).toContain('patronage')
      expect(slovenskoIndexDelta(id)).toBeLessThan(0)
    }
    // Clean shop never tanks the country; the transparency cards lift it (dôvera občanov).
    for (const id of cleanShopCardIds) {
      expect(cards[id].tags).not.toContain('patronage')
      expect(slovenskoIndexDelta(id)).toBeGreaterThanOrEqual(0)
    }
    expect(slovenskoIndexDelta('verejne-obstaravanie')).toBeGreaterThan(0)
    expect(slovenskoIndexDelta('protikorupcny-audit')).toBeGreaterThan(0)

    // The oligarch card scales off captured office and builds party power (offices + media).
    const oligarcha = cards.oligarcha
    expect(oligarcha.effects.some((e) => e.type === 'addPodporaPer' && e.stat === 'offices')).toBe(
      true,
    )
    expect(
      oligarcha.effects.some((e) => e.type === 'gainResource' && e.resource === 'media'),
    ).toBe(true)
  })
})
