import type { DeckCardInstance } from './types'
import type { Rng } from '../types'

/** Fisher–Yates using seeded rng. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function drawCards(
  drawPile: DeckCardInstance[],
  discardPile: DeckCardInstance[],
  count: number,
  rng: Rng,
): {
  drawn: DeckCardInstance[]
  drawPile: DeckCardInstance[]
  discardPile: DeckCardInstance[]
} {
  let pile = [...drawPile]
  let discard = [...discardPile]
  const drawn: DeckCardInstance[] = []

  for (let n = 0; n < count; n++) {
    if (pile.length === 0) {
      if (discard.length === 0) break
      pile = shuffle(discard, rng)
      discard = []
    }
    const card = pile.shift()
    if (!card) break
    drawn.push(card)
  }

  return { drawn, drawPile: pile, discardPile: discard }
}
