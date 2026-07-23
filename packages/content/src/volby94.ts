import type { NpcArchetypeId } from './npcParties'

export type CampaignRegion = 'zapad' | 'stred' | 'vychod'
export type CampaignChannel = 'billboards' | 'rallies' | 'tv' | 'negative'
export type CoalitionPost = 'interior' | 'fnm-chair' | 'culture' | 'economy'
export type InstitutionId = 'sis' | 'stv' | 'fnm' | 'policia' | 'justicia'
export type InstitutionAssignee = 'player' | NpcArchetypeId

export const campaignRegions: CampaignRegion[] = ['zapad', 'stred', 'vychod']

export const campaignChannels: Record<
  CampaignChannel,
  {
    labelSk: string
    /** Preferencie per 10k Sk base */
    efficiency: number
    reputacia?: number
    /** TV is cheaper when Médiá is high */
    mediaDiscount?: boolean
  }
> = {
  billboards: { labelSk: 'Billboardy', efficiency: 0.12 },
  rallies: { labelSk: 'Mítinky', efficiency: 0.18 },
  tv: { labelSk: 'TV spoty', efficiency: 0.22, reputacia: -0.2, mediaDiscount: true },
  negative: { labelSk: 'Negatívna kampaň', efficiency: 0.28, reputacia: -0.6 },
}

export const coalitionPosts: Record<
  CoalitionPost,
  { labelSk: string; /** AI acceptance weight; interior is expensive */ value: number }
> = {
  interior: { labelSk: 'Vnútro', value: 3.2 },
  'fnm-chair': { labelSk: 'Predseda FNM', value: 2.4 },
  culture: { labelSk: 'Kultúra', value: 1.0 },
  economy: { labelSk: 'Hospodárstvo', value: 1.6 },
}

/** Partner accepts when offered value ≥ this threshold. */
export const coalitionAcceptThreshold = 2.2

export const institutions: Record<InstitutionId, { labelSk: string }> = {
  sis: { labelSk: 'SIS' },
  stv: { labelSk: 'STV' },
  fnm: { labelSk: 'Predstavenstvo FNM' },
  policia: { labelSk: 'Polícia' },
  justicia: { labelSk: 'Justícia' },
}

export const volby94CampaignRounds = 3
export const volby94FactId = 'fact-volby-94' as const
