import type {
  CardId,
  DeckArchetypeId,
  EventChoiceId,
  EventId,
  FactId,
} from '@devedesiatky/content'

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
  cardId: CardId
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
  resources: DeckResources
  govOrOpposition: 'government' | 'opposition'
  activeEventId: EventId | null
  resolvedEventIds: EventId[]
  pendingFactId: FactId | null
  collectedFactIds: FactId[]
  /** Client education metric — fact overlays opened (collect or dismiss). */
  factOpens: number
  phaseAfterFact: DeckPhase | null
  nextInstanceSeq: number
}

export type DeckAction =
  | { type: 'START_RUN'; archetypeId: DeckArchetypeId; seed: number }
  | { type: 'DRAW_HAND' }
  | { type: 'PLAY_CARD'; instanceId: string }
  | { type: 'END_QUARTER' }
  | { type: 'SHOP_SKIP' }
  | { type: 'OPEN_EVENT' }
  | { type: 'RESOLVE_EVENT'; choiceId: EventChoiceId }
  | { type: 'COLLECT_FACT' }
  | { type: 'DISMISS_FACT' }
