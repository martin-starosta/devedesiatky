/** Closed card-effect schema — GDD v3 §10.2. No free-form scripts. */

export type CardEffectStat = 'kult' | 'offices' | 'media'

export type CardEffectResource =
  | 'preferencie'
  | 'pokladna'
  | 'reputacia'
  | 'media'
  | 'kult'
  | 'koalicia'
  | 'offices'

export type CardEffect =
  | { type: 'addPodpora'; amount: number }
  | { type: 'addMobilizacia'; amount: number }
  | { type: 'addPodporaPer'; stat: CardEffectStat; amount: number }
  | { type: 'addMobilizaciaPer'; stat: CardEffectStat; amount: number }
  | { type: 'gainResource'; resource: CardEffectResource; amount: number }
  | { type: 'gainEnergy'; amount: number }
  | { type: 'draw'; amount: number }
  | { type: 'addKauza'; kauzaTypeId: string; count?: number }
  | { type: 'bossDamage'; amount: number }
  | { type: 'bossBlock'; amount: number }

export type CardTag = 'patronage' | 'kult' | 'campaign' | 'kauza' | 'basic'

export type CardId =
  | 'miting'
  | 'bilbordy'
  | 'slub'
  | 'regionalna-siet'
  | 'kult-event'

export type CardDef = {
  id: CardId
  titleSk: string
  blurbSk: string
  energyCost: number
  tags: CardTag[]
  effects: CardEffect[]
}

/** MVP-A stub / starter pool — enough to clear opening kvóta. */
export const cards: Record<CardId, CardDef> = {
  miting: {
    id: 'miting',
    titleSk: 'Míting',
    blurbSk: 'Dav na námestí. Podpora hore.',
    energyCost: 1,
    tags: ['basic', 'campaign'],
    effects: [{ type: 'addPodpora', amount: 10 }],
  },
  bilbordy: {
    id: 'bilbordy',
    titleSk: 'Bilbordy',
    blurbSk: 'Plagáty na každé stĺpy.',
    energyCost: 1,
    tags: ['basic', 'campaign'],
    effects: [
      { type: 'addPodpora', amount: 4 },
      { type: 'addMobilizacia', amount: 1 },
    ],
  },
  slub: {
    id: 'slub',
    titleSk: 'Sľub',
    blurbSk: 'Veľké reči, väčšia mobilizácia.',
    energyCost: 1,
    tags: ['basic'],
    effects: [{ type: 'addMobilizacia', amount: 2 }],
  },
  'regionalna-siet': {
    id: 'regionalna-siet',
    titleSk: 'Regionálna sieť',
    blurbSk: 'Kancelárie ťahajú hlasy.',
    energyCost: 1,
    tags: ['basic'],
    effects: [{ type: 'addPodporaPer', stat: 'offices', amount: 2 }],
  },
  'kult-event': {
    id: 'kult-event',
    titleSk: 'Kult event',
    blurbSk: 'Show pre verných.',
    energyCost: 1,
    tags: ['kult'],
    effects: [{ type: 'addPodporaPer', stat: 'kult', amount: 3 }],
  },
}

export type DeckArchetypeId = 'stroj-moci'

export type DeckArchetype = {
  id: DeckArchetypeId
  labelSk: string
  blurbSk: string
  /** Card ids in the starting deck (multiples allowed). */
  startingDeck: CardId[]
  preferencie: number
  pokladna: number
  offices: number
  kult: number
}

export const deckArchetypes: Record<DeckArchetypeId, DeckArchetype> = {
  'stroj-moci': {
    id: 'stroj-moci',
    labelSk: 'Stroj moci',
    blurbSk: 'Jeden archetyp Act I — silný štart, učí sa engine.',
    startingDeck: [
      'miting',
      'miting',
      'miting',
      'bilbordy',
      'bilbordy',
      'slub',
      'slub',
      'regionalna-siet',
      'kult-event',
      'miting',
    ],
    preferencie: 10,
    pokladna: 50_000,
    offices: 3,
    kult: 1,
  },
}

/** Opening kvóta for Act I Q1 — stub path must clear with a good hand. */
export const actIOpeningQuota = 20

/** Act I length in engine quarters. */
export const actIQuarterCount = 6

/** Kvóta increase applied at the start of each subsequent quarter. */
export const actIQuotaGrowthPerQuarter = 5

/** Preferencie banked when kvóta is cleared. */
export const quotaClearPreferencie = 1

/** Preferencie lost when kvóta is missed. */
export const quotaMissPreferencieBleed = 1

/** Pokladňa per overkill point past kvóta. */
export const overkillPokladnaPerPoint = 1000

export const defaultHandSize = 5
export const defaultEnergyMax = 3
