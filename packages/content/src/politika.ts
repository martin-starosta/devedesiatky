export type PolitikaActionId =
  | 'pass-policy'
  | 'appoint-loyalist'
  | 'pressure-media'
  | 'rally'
  | 'investigate-kauza'
  | 'diplomacy'
  | 'foreign-photo-op'

export type PolitikaActionDef = {
  id: PolitikaActionId
  labelSk: string
  blurbSk: string
  /** Who may take this action */
  role: 'government' | 'opposition' | 'both'
  effects: {
    preferencie?: number
    reputacia?: number
    media?: number
  }
}

export const politikaActions: Record<PolitikaActionId, PolitikaActionDef> = {
  'pass-policy': {
    id: 'pass-policy',
    labelSk: 'Presadiť zákon',
    blurbSk: 'Krátky preferenčný bump, mierny úder do reputácie.',
    role: 'government',
    effects: { preferencie: 0.6, reputacia: -0.3 },
  },
  'appoint-loyalist': {
    id: 'appoint-loyalist',
    labelSk: 'Vymenovať lojalistu',
    blurbSk: 'Kontrola inštitúcií (médiá hore), Západ mračí.',
    role: 'government',
    effects: { media: 1.2, reputacia: -0.8 },
  },
  'pressure-media': {
    id: 'pressure-media',
    labelSk: 'Pritlačiť na médiá',
    blurbSk: 'Štátna televízia počúva. Reputácia klesá.',
    role: 'government',
    effects: { media: 0.9, reputacia: -0.5, preferencie: 0.2 },
  },
  rally: {
    id: 'rally',
    labelSk: 'Mítink',
    blurbSk: 'Ľudia na námestí. Preferencie hore.',
    role: 'opposition',
    effects: { preferencie: 0.8 },
  },
  'investigate-kauza': {
    id: 'investigate-kauza',
    labelSk: 'Vyšetrovať kauzu',
    blurbSk: 'Tlak na vládu, občiansky kredit.',
    role: 'opposition',
    effects: { preferencie: 0.4, reputacia: 0.5 },
  },
  diplomacy: {
    id: 'diplomacy',
    labelSk: 'Diplomatické snahy',
    blurbSk: 'Spojenci v parlamente a mimo neho.',
    role: 'opposition',
    effects: { reputacia: 0.6 },
  },
  'foreign-photo-op': {
    id: 'foreign-photo-op',
    labelSk: 'Foto z Bruselu',
    blurbSk: 'Západny foto-op. Reputácia a jemný bump.',
    role: 'opposition',
    effects: { reputacia: 1.0, preferencie: 0.3 },
  },
}

export const startingReputacia = 5
export const startingMedia = 3

/** AP budget band for each Politika phase. */
export const politikaApBand = { min: 2, max: 3 } as const
