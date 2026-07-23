import type { NpcArchetypeId } from '../content/npcParties'
import type { KauzaCondition, KauzaStatus } from '../content/kauzy'
import type { CompanyId, SponsorId } from '../content/patronage'
import type { PolitikaActionId } from '../content/politika'
import type { EventChoiceId, EventId, FactId } from '../content/timeline'
import type {
  CampaignChannel,
  CampaignRegion,
  CoalitionPost,
  InstitutionAssignee,
  InstitutionId,
} from '../content/volby94'
import type { NpcPartyState } from './npcRoster'

export type Quarter = 1 | 2 | 3 | 4

export type Phase = 'setup' | 'playing'

export type TurnPhase =
  | 'politika'
  | 'peniaze'
  | 'event'
  | 'fact'
  | 'centrala'
  | 'volby-kampan'
  | 'volby-noc'
  | 'volby-koalicia'
  | 'volby-noc-nozo'

export type ElectionStage = 'campaign' | 'night' | 'coalition' | 'noc'

export type ElectionState = {
  id: 'volby-94'
  stage: ElectionStage
  campaignRound: 1 | 2 | 3
  maxRounds: number
  boostByRegion: Record<CampaignRegion, number>
  totalBoost: number
  exitPoll: number | null
  finalShare: number | null
  won: boolean | null
  coalitionPartnerId: NpcArchetypeId | null
  offeredPosts: CoalitionPost[]
  acceptedPosts: CoalitionPost[]
  institutions: Record<InstitutionId, InstitutionAssignee | null>
}

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

export type { CompanyId, SponsorId, PolitikaActionId, EventId, EventChoiceId, FactId, NpcArchetypeId }
export type { NpcPartyState }
export type { KauzaCondition, KauzaStatus }

export type KauzaEntry = {
  id: string
  companyId: CompanyId
  sponsorId: SponsorId
  year: number
  quarter: Quarter
  pressure: number
  conditions: KauzaCondition[]
  status: KauzaStatus
}

export type FnmDestination =
  | { kind: 'sponsor'; sponsorId: SponsorId }
  | { kind: 'partner' }
  | { kind: 'auction' }
  | { kind: 'cancel' }

export type FnmAssignment = FnmDestination

export type PatronagePower = 'limited' | 'full'

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
  /** Coalition stability 0–100; ≤0 collapses the government. */
  koalicia: number
  reputacia: number
  media: number
  actionPoints: number
  /** Companies still available in the privatization pool */
  fnmPool: CompanyId[]
  /** Companies offered this Peniaze phase */
  fnmOffered: CompanyId[]
  /** Resolved FNM destinations this run */
  fnmAssigned: Partial<Record<CompanyId, FnmAssignment>>
  kauzy: KauzaEntry[]
  /** Visible Eye pressure — sum of latent/muted ledger pressures */
  kauzyPressure: number
  /** True after leaving office with a ledger: archives in hostile hands */
  hostileLedger: boolean
  activeEventId: EventId | null
  pendingFactId: FactId | null
  collectedFactIds: FactId[]
  resolvedEventIds: EventId[]
  patronagePower: PatronagePower
  trustDebt: number
  npcParties: NpcPartyState[]
  mainAntagonistId: NpcArchetypeId | null
  election: ElectionState | null
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
      type: 'SPEND_POLITIKA'
      actionId: PolitikaActionId
    }
  | {
      type: 'FINISH_POLITIKA'
    }
  | {
      type: 'ASSIGN_FNM'
      companyId: CompanyId
      destination: FnmDestination
    }
  | {
      /** @deprecated Prefer ASSIGN_FNM with sponsor destination */
      type: 'ASSIGN_TO_SPONSOR'
      companyId: CompanyId
      sponsorId: SponsorId
    }
  | {
      type: 'FINISH_PENIAZE'
    }
  | {
      type: 'TRY_OPEN_EVENT'
    }
  | {
      type: 'RESOLVE_EVENT'
      choiceId: EventChoiceId
    }
  | {
      type: 'COLLECT_FACT'
    }
  | {
      type: 'DISMISS_FACT'
    }
  | {
      type: 'CAMPAIGN_SPEND'
      region: CampaignRegion
      channel: CampaignChannel
      amount: number
    }
  | {
      type: 'FINISH_CAMPAIGN'
    }
  | {
      type: 'RESOLVE_ELECTION_NIGHT'
    }
  | {
      type: 'CONTINUE_AFTER_NIGHT'
    }
  | {
      type: 'OFFER_COALITION'
      partnerId: NpcArchetypeId
      posts: CoalitionPost[]
    }
  | {
      type: 'FINISH_COALITION'
    }
  | {
      type: 'SKIP_NOC_NOZOV'
    }
  | {
      type: 'ASSIGN_INSTITUTION'
      institutionId: InstitutionId
      assigneeId: InstitutionAssignee
    }
  | {
      type: 'FINISH_NOC_NOZOV'
    }

export type Rng = {
  next: () => number
  state: number
}
