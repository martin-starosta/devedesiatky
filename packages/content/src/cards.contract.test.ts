import { describe, expect, it } from 'vitest'
import {
  actIOpeningQuota,
  cards,
  deckArchetypes,
  type CardEffect,
  type CardId,
} from './cards'

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
  it('resolves every stub card id and closed effects', () => {
    for (const card of Object.values(cards)) {
      expect(cards[card.id]).toBe(card)
      expect(card.titleSk.length).toBeGreaterThan(0)
      expect(card.energyCost).toBeGreaterThanOrEqual(0)
      for (const effect of card.effects) {
        assertEffect(effect)
      }
    }
  })

  it('resolves archetype starting-deck card ids', () => {
    expect(actIOpeningQuota).toBeGreaterThan(0)
    for (const archetype of Object.values(deckArchetypes)) {
      expect(archetype.startingDeck.length).toBeGreaterThanOrEqual(8)
      for (const id of archetype.startingDeck) {
        expect(cards[id as CardId]).toBeDefined()
      }
    }
  })
})
