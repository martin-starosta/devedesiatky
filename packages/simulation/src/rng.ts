import type { Rng } from './types'

/** Mulberry32 — tiny seedable PRNG; state is serializable for saves/replays. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0
  return {
    get state() {
      return state
    },
    next() {
      state = (state + 0x6d2b79f5) >>> 0
      let t = Math.imul(state ^ (state >>> 15), 1 | state)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
  }
}
