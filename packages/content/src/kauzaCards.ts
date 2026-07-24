import type { KauzaCondition } from './kauzy'
import { cards, type CardDef, type CardId } from './cards'

/** Kauza curse card ids — clog the deck (GDD v3 §5). */
export type KauzaCardId =
  | 'kauza-tunel'
  | 'kauza-urok'
  | 'kauza-novinar'
  | 'kauza-defektor'
  | 'kauza-archiv'

export type KauzaCardDef = Omit<CardDef, 'id'> & {
  id: KauzaCardId
  conditions: KauzaCondition[]
  /** Preferencie/reputácia pressure used when #33 detonates. */
  pressure: number
  nevymazatelnaOnDetonate?: boolean
}

export const kauzaCards: Record<KauzaCardId, KauzaCardDef> = {
  'kauza-tunel': {
    id: 'kauza-tunel',
    titleSk: 'Kauza — tunel',
    blurbSk: 'Peniaze pretečú. V ruke zbytočná.',
    energyCost: 1,
    tags: ['kauza'],
    effects: [],
    conditions: ['journalist', 'defector', 'lossOfPower'],
    pressure: 1.2,
  },
  'kauza-urok': {
    id: 'kauza-urok',
    titleSk: 'Kauza — úrok',
    blurbSk: 'Dlžoba sponzorovi. Nič neskóruje.',
    energyCost: 1,
    tags: ['kauza'],
    effects: [],
    conditions: ['defector', 'lossOfPower'],
    pressure: 1,
  },
  'kauza-novinar': {
    id: 'kauza-novinar',
    titleSk: 'Kauza — novinár',
    blurbSk: 'Niektoré otázky nechceš počuť.',
    energyCost: 0,
    tags: ['kauza'],
    effects: [],
    conditions: ['journalist'],
    pressure: 1.4,
    nevymazatelnaOnDetonate: true,
  },
  'kauza-defektor': {
    id: 'kauza-defektor',
    titleSk: 'Kauza — defektor',
    blurbSk: 'Bývalý káder vie príliš veľa.',
    energyCost: 1,
    tags: ['kauza'],
    effects: [],
    conditions: ['defector', 'lossOfPower'],
    pressure: 1.3,
  },
  'kauza-archiv': {
    id: 'kauza-archiv',
    titleSk: 'Kauza — archív',
    blurbSk: 'Zložka čaká na otvorenie.',
    energyCost: 1,
    tags: ['kauza'],
    effects: [],
    conditions: ['lossOfPower'],
    pressure: 1.5,
  },
}

export const kauzaCardIds = Object.keys(kauzaCards) as KauzaCardId[]

/** Shop prices (Pokladňa). Patronage is cheaper — thesis temptation. */
export const cleanShopPrice = 8_000
export const patronageShopPrice = 5_000
export const patronageKauzaInjectMin = 1
export const patronageKauzaInjectMax = 2
export const shopOfferCount = 3

export type AnyPlayableCardId = CardId | KauzaCardId

export function lookupCard(id: string): CardDef | KauzaCardDef | undefined {
  if (id in kauzaCards) return kauzaCards[id as KauzaCardId]
  if (id in cards) return cards[id as CardId]
  return undefined
}

export function isKauzaCardId(id: string): id is KauzaCardId {
  return id in kauzaCards
}
