import type { CompanyId, SponsorId } from '../content/patronage'

export type Quarter = 1 | 2 | 3 | 4

export type Phase = 'setup' | 'playing'

export type TurnPhase = 'peniaze' | 'centrala'

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

export type { CompanyId, SponsorId }

export type KauzaEntry = {
  id: string
  companyId: CompanyId
  sponsorId: SponsorId
  year: number
  quarter: Quarter
  pressure: number
}

export type GameState = {
  seed: number
  rngState: number
  phase: Phase
  turnPhase: TurnPhase
  year: number
  quarter: Quarter
  preferencie: number
  pokladna: number
  offices: number
  ideology: Ideology
  demographicWeights: DemographicWeights
  presetId: PartyPresetId | null
  inGovernment: boolean
  /** Companies still available in the privatization pool */
  fnmPool: CompanyId[]
  /** Companies offered this Peniaze phase */
  fnmOffered: CompanyId[]
  /** companyId → sponsorId for completed dirty deals */
  fnmAssigned: Partial<Record<CompanyId, SponsorId>>
  kauzy: KauzaEntry[]
  /** Visible Eye pressure — sum of ledger pressures (detonation later) */
  kauzyPressure: number
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
  | {
      type: 'ASSIGN_TO_SPONSOR'
      companyId: CompanyId
      sponsorId: SponsorId
    }
  | {
      type: 'FINISH_PENIAZE'
    }

export type Rng = {
  next: () => number
  state: number
}
