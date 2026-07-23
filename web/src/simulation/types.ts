export type Quarter = 1 | 2 | 3 | 4

export type GameState = {
  seed: number
  rngState: number
  year: number
  quarter: Quarter
  preferencie: number
}

export type GameAction = {
  type: 'ADVANCE_QUARTER'
}

export type Rng = {
  next: () => number
  state: number
}
