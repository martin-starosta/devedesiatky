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
  | 'tlak-na-media'
  | 'letaky'
  | 'stranicka-skola'
  | 'koalicny-obed'
  | 'zahranicna-cesta'
  | 'megashow'
  | 'sponzor-galavecer'
  | 'privatizacny-tip'
  | 'fnm-kontakt'
  | 'verejna-sutaz-karta'
  | 'dobrovolnici'
  | 'telefonna-banka'
  | 'noviny-titulka'
  | 'odbory-dohoda'
  | 'kampan-autobus'

export type CardDef = {
  id: CardId
  titleSk: string
  blurbSk: string
  energyCost: number
  tags: CardTag[]
  effects: CardEffect[]
}

/** Act I political action pool (~20). Patronage cards are strongest scorers. */
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
    blurbSk: 'Show pre verných — rastie s Kultom.',
    energyCost: 1,
    tags: ['kult'],
    effects: [{ type: 'addPodporaPer', stat: 'kult', amount: 3 }],
  },
  'tlak-na-media': {
    id: 'tlak-na-media',
    titleSk: 'Tlak na médiá',
    blurbSk: 'Redakcie počúvajú. +Médiá, podpora podľa kontroly.',
    energyCost: 1,
    tags: ['campaign'],
    effects: [
      { type: 'gainResource', resource: 'media', amount: 1 },
      { type: 'addPodporaPer', stat: 'media', amount: 2 },
    ],
  },
  letaky: {
    id: 'letaky',
    titleSk: 'Letáky',
    blurbSk: 'Lacná kampaň do schránok.',
    energyCost: 1,
    tags: ['basic', 'campaign'],
    effects: [{ type: 'addPodpora', amount: 6 }],
  },
  'stranicka-skola': {
    id: 'stranicka-skola',
    titleSk: 'Stranícka škola',
    blurbSk: 'Kadre sa učia. Ťahaj ďalšiu kartu.',
    energyCost: 1,
    tags: ['basic'],
    effects: [
      { type: 'draw', amount: 1 },
      { type: 'addMobilizacia', amount: 1 },
    ],
  },
  'koalicny-obed': {
    id: 'koalicny-obed',
    titleSk: 'Koaličný obed',
    blurbSk: 'Partneri sú ticho. +Koalícia.',
    energyCost: 1,
    tags: ['basic'],
    effects: [
      { type: 'gainResource', resource: 'koalicia', amount: 5 },
      { type: 'addPodpora', amount: 3 },
    ],
  },
  'zahranicna-cesta': {
    id: 'zahranicna-cesta',
    titleSk: 'Zahraničná cesta',
    blurbSk: 'Foto z Bruselu. +Reputácia.',
    energyCost: 2,
    tags: ['basic'],
    effects: [
      { type: 'gainResource', resource: 'reputacia', amount: 1 },
      { type: 'addPodpora', amount: 5 },
    ],
  },
  megashow: {
    id: 'megashow',
    titleSk: 'Megashow',
    blurbSk: 'Štadión plný. Kult a podpora.',
    energyCost: 2,
    tags: ['kult', 'campaign'],
    effects: [
      { type: 'gainResource', resource: 'kult', amount: 1 },
      { type: 'addPodpora', amount: 8 },
      { type: 'addMobilizacia', amount: 1 },
    ],
  },
  'sponzor-galavecer': {
    id: 'sponzor-galavecer',
    titleSk: 'Sponzor — galavečer',
    blurbSk: 'Šampaňské a kontrakty. Silná karta, špinavá.',
    energyCost: 1,
    tags: ['patronage'],
    effects: [
      { type: 'addPodpora', amount: 14 },
      { type: 'addMobilizacia', amount: 1 },
      { type: 'gainResource', resource: 'pokladna', amount: 15_000 },
    ],
  },
  'privatizacny-tip': {
    id: 'privatizacny-tip',
    titleSk: 'Privatizačný tip',
    blurbSk: 'Vedieť skôr ako ostatní. Obrovská podpora.',
    energyCost: 1,
    tags: ['patronage'],
    effects: [
      { type: 'addPodpora', amount: 16 },
      { type: 'gainResource', resource: 'reputacia', amount: -0.5 },
    ],
  },
  'fnm-kontakt': {
    id: 'fnm-kontakt',
    titleSk: 'FNM kontakt',
    blurbSk: 'Dvere do fondu. Mobilizácia a peniaze.',
    energyCost: 1,
    tags: ['patronage'],
    effects: [
      { type: 'addMobilizacia', amount: 3 },
      { type: 'addPodpora', amount: 8 },
      { type: 'gainResource', resource: 'pokladna', amount: 20_000 },
    ],
  },
  'verejna-sutaz-karta': {
    id: 'verejna-sutaz-karta',
    titleSk: 'Verejná súťaž',
    blurbSk: 'Čistejšia cesta. Slabšia, ale bez špiny.',
    energyCost: 1,
    tags: ['basic'],
    effects: [
      { type: 'addPodpora', amount: 7 },
      { type: 'gainResource', resource: 'reputacia', amount: 0.5 },
    ],
  },
  dobrovolnici: {
    id: 'dobrovolnici',
    titleSk: 'Dobrovoľníci',
    blurbSk: 'Zapálení mladí. Energia späť.',
    energyCost: 0,
    tags: ['basic', 'campaign'],
    effects: [
      { type: 'gainEnergy', amount: 1 },
      { type: 'addPodpora', amount: 3 },
    ],
  },
  'telefonna-banka': {
    id: 'telefonna-banka',
    titleSk: 'Telefónna banka',
    blurbSk: 'Volania do večera.',
    energyCost: 1,
    tags: ['campaign'],
    effects: [
      { type: 'addPodpora', amount: 5 },
      { type: 'addMobilizaciaPer', stat: 'offices', amount: 1 },
    ],
  },
  'noviny-titulka': {
    id: 'noviny-titulka',
    titleSk: 'Noviny — titulka',
    blurbSk: 'Ráno na prvej strane. Škáluje s Médiami.',
    energyCost: 1,
    tags: ['campaign'],
    effects: [{ type: 'addMobilizaciaPer', stat: 'media', amount: 1 }],
  },
  'odbory-dohoda': {
    id: 'odbory-dohoda',
    titleSk: 'Odbory — dohoda',
    blurbSk: 'Tichá podpora z fabrík.',
    energyCost: 1,
    tags: ['basic'],
    effects: [
      { type: 'addPodpora', amount: 9 },
      { type: 'gainResource', resource: 'koalicia', amount: 2 },
    ],
  },
  'kampan-autobus': {
    id: 'kampan-autobus',
    titleSk: 'Kampaňový autobus',
    blurbSk: 'Cesta krajom. Ťahaj kartu.',
    energyCost: 1,
    tags: ['campaign'],
    effects: [
      { type: 'addPodpora', amount: 6 },
      { type: 'draw', amount: 1 },
    ],
  },
}

export const actICardIds = Object.keys(cards) as CardId[]

/** Clean shop pool (weaker, no patronage). */
export const cleanShopCardIds: CardId[] = [
  'letaky',
  'verejna-sutaz-karta',
  'dobrovolnici',
  'stranicka-skola',
  'zahranicna-cesta',
  'odbory-dohoda',
]

/** Patronage shop pool (strongest scorers — thesis temptation). */
export const patronageShopCardIds: CardId[] = [
  'sponzor-galavecer',
  'privatizacny-tip',
  'fnm-kontakt',
]

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
      'letaky',
      'dobrovolnici',
      'telefonna-banka',
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
