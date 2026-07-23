export type Quarter = 1 | 2 | 3 | 4

export type Phase = 'setup' | 'playing'

/** Each axis is -1 … +1. */
export type Ideology = {
  narodnyObciansky: number
  socialnyTrhovy: number
  vychodZapad: number
}

export type PartyPresetId = 'hnutie-machine' | 'challenger'

export type DemographicId =
  | 'narodovci'
  | 'mestania'
  | 'robotnici'
  | 'podnikatelia'
  | 'zapadniari'
  | 'vychodniari'

export type DemographicWeights = Record<DemographicId, number>

export type GameState = {
  seed: number
  rngState: number
  phase: Phase
  year: number
  quarter: Quarter
  preferencie: number
  pokladna: number
  offices: number
  ideology: Ideology
  demographicWeights: DemographicWeights
  presetId: PartyPresetId | null
}

export type GameAction =
  | {
      type: 'ADVANCE_QUARTER'
    }
  | {
      type: 'FOUND_PARTY'
      ideology?: Ideology
      preset?: PartyPresetId
    }

export type Rng = {
  next: () => number
  state: number
}
