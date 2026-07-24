import type {
  AnyPlayableCardId,
  BossIntentId,
  DeckArchetypeId,
  EventChoiceId,
  EventId,
  FactId,
  KauzaCardId,
  SponsorId,
} from '@devedesiatky/content'

export type BossState = {
  round: number
  maxRounds: number
  /** Rival hp-analogue. */
  bossSupport: number
  playerBlock: number
  bossBlock: number
  telegraph: BossIntentId
  nextSmearBuff: number
  outcome: 'win' | 'lose' | null
}

export type DeckPhase =
  | 'DRAW'
  | 'PLAY'
  | 'RESOLVE'
  | 'ACQUIRE'
  | 'FACT'
  | 'BOSS'
  | 'TERMINAL'

export type AcquireNode =
  | 'shop-clean'
  | 'shop-patronage'
  | 'event'
  | 'institution'
  | 'rest'
  | 'skip'

export type DeckCardInstance = {
  /** Unique instance id in this run. */
  instanceId: string
  cardId: AnyPlayableCardId
  /** Only set for kauza curse instances. */
  kauzaStatus?: 'latent' | 'muted' | 'detonated' | 'nevymazatelna'
  /** Odpočinok upgrade: −1 energy cost when playing. */
  upgraded?: boolean
}

export type SponsorDebt = {
  sponsorId: SponsorId
  obligations: number
}

export type DeckResources = {
  preferencie: number
  pokladna: number
  reputacia: number
  media: number
  koalicia: number
  kult: number
  slovenskoIndex: number
  offices: number
}

export type DeckRunState = {
  seed: number
  rngState: number
  act: 1
  /** 1-based quarter within the act (Act I: 1–6). */
  quarter: number
  year: number
  calendarQuarter: 1 | 2 | 3 | 4
  phase: DeckPhase
  acquireNode: AcquireNode | null
  shopOffers: AnyPlayableCardId[] | null
  sponsors: SponsorDebt[]
  archetypeId: DeckArchetypeId
  deck: DeckCardInstance[]
  hand: DeckCardInstance[]
  drawPile: DeckCardInstance[]
  discardPile: DeckCardInstance[]
  exhaustPile: DeckCardInstance[]
  energy: number
  energyMax: number
  handSize: number
  quota: number
  quotaBase: number
  quarterPodpora: number
  quarterMobilizacia: number
  /** Last settled score (Podpora × Mobilizácia); null before first settle. */
  lastScore: number | null
  lastCleared: boolean | null
  bossAdvantage: boolean
  boss: BossState | null
  /** After boss loss: mute unavailable; kauzy in hostile hands. */
  hostileKauzy: boolean
  resources: DeckResources
  govOrOpposition: 'government' | 'opposition'
  activeEventId: EventId | null
  resolvedEventIds: EventId[]
  pendingFactId: FactId | null
  collectedFactIds: FactId[]
  /** Client education metric — fact overlays opened (collect or dismiss). */
  factOpens: number
  phaseAfterFact: DeckPhase | null
  /** Conditions armed this quarter (lossOfPower may persist). */
  armedConditions: import('@devedesiatky/content').KauzaCondition[]
  relics: import('@devedesiatky/content').RelicId[]
  pozornost: number
  sisExileUsedThisAct: boolean
  restRemovesUsed: number
  nextInstanceSeq: number
}

export type DeckAction =
  | { type: 'START_RUN'; archetypeId: DeckArchetypeId; seed: number }
  | { type: 'DRAW_HAND' }
  | { type: 'PLAY_CARD'; instanceId: string }
  | { type: 'END_QUARTER' }
  | { type: 'SHOP_SKIP' }
  | { type: 'OPEN_EVENT' }
  | { type: 'OPEN_SHOP'; kind: 'shop-clean' | 'shop-patronage' }
  | { type: 'OPEN_REST' }
  | { type: 'OPEN_INSTITUTION' }
  | { type: 'SHOP_BUY'; cardId: AnyPlayableCardId }
  | { type: 'TAKE_PATRONAGE'; cardId: AnyPlayableCardId; sponsorId?: SponsorId }
  | { type: 'REMOVE_CARD'; instanceId: string }
  | { type: 'UPGRADE_CARD'; instanceId: string }
  | { type: 'CLAIM_RELIC'; relicId: import('@devedesiatky/content').RelicId }
  | { type: 'USE_SIS_EXILE'; instanceId: string }
  | { type: 'RESOLVE_EVENT'; choiceId: EventChoiceId }
  | { type: 'COLLECT_FACT' }
  | { type: 'DISMISS_FACT' }
  | { type: 'ARM_CONDITION'; condition: import('@devedesiatky/content').KauzaCondition }
  | { type: 'BOSS_PLAY'; instanceId: string }
  | { type: 'BOSS_END_TURN' }

export type { KauzaCardId }
