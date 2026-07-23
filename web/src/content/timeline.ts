/**
 * Content guidelines (MVP1):
 * - No profitable tragedy: victim/atrocity cards must not yield net Preferencie/Pokladňa gains.
 * - Fictional parties/people on stage; real officials appear only inside sourced fact cards.
 * - Fact cards: max ~3 sentences, skippable, collectible on Časová os.
 */

export type FactId =
  | 'fact-vznik-republiky'
  | 'fact-kuponka'
  | 'fact-pad-vlady'
  | 'fact-volby-94-stub'

export type EventId = 'vznik-republiky' | 'kuponka' | 'pad-vlady' | 'volby-94-stub'

export type EventChoiceId =
  | 'celebrate'
  | 'organize'
  | 'continue-wave'
  | 'cancel-wave'
  | 'watch-collapse'
  | 'exploit-crisis'
  | 'brace-election'
  | 'mobilize'

export type FactCard = {
  id: FactId
  titleSk: string
  bodySk: string
  /** Public documented source hook for later historian lock (#12). */
  sourceHook: string
}

export type EventChoice = {
  id: EventChoiceId
  labelSk: string
  role: 'government' | 'opposition' | 'both'
  effects: {
    preferencie?: number
    reputacia?: number
    koalicia?: number
    trustDebt?: number
    patronagePower?: 'limited' | 'full'
  }
}

export type TimelineEvent = {
  id: EventId
  titleSk: string
  bodySk: string
  year: number
  quarter: 1 | 2 | 3 | 4
  factId: FactId
  choices: EventChoice[]
}

export const factCards: Record<FactId, FactCard> = {
  'fact-vznik-republiky': {
    id: 'fact-vznik-republiky',
    titleSk: '1. január 1993',
    bodySk:
      'Vznikla samostatná Slovenská republika. Nový štát zdedil inštitúcie, dlhy aj spor o majetok po federácii.',
    sourceHook: 'Ústava SR / chronológia vzniku SR (1993)',
  },
  'fact-kuponka': {
    id: 'fact-kuponka',
    titleSk: 'Kupónová privatizácia',
    bodySk:
      'Druhá vlna bola v praxi zrušená; občania dostali dlhopisy FNM (nominál 10 000 Sk), kým priame predaje šli predvybraným kupcom.',
    sourceHook: 'FNM / historiografia kupónovej privatizácie (1995)',
  },
  'fact-pad-vlady': {
    id: 'fact-pad-vlady',
    titleSk: 'Marec 1994',
    bodySk:
      'Parlament odvolal vládu; nasledovala úradnícka vláda a cesta k predčasným voľbám.',
    sourceHook: 'NR SR: odvolanie vlády (marec 1994)',
  },
  'fact-volby-94-stub': {
    id: 'fact-volby-94-stub',
    titleSk: 'Voľby 1994',
    bodySk:
      'Jesenné voľby 1994 predznamenali novú koaličnú matematiku. Plný volebný boss príde neskôr.',
    sourceHook: 'ŠÚ SR: výsledky volieb do NR SR 1994',
  },
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'vznik-republiky',
    titleSk: 'Vznik republiky',
    bodySk: 'Nový štát, prázdna pokladňa strán, všetko sa ešte len rozdáva.',
    year: 1993,
    quarter: 1,
    factId: 'fact-vznik-republiky',
    choices: [
      {
        id: 'celebrate',
        labelSk: 'Slávnostný tón v štátnych médiách',
        role: 'government',
        effects: { preferencie: 0.4, reputacia: -0.2 },
      },
      {
        id: 'organize',
        labelSk: 'Organizačný zraz v regiónoch',
        role: 'opposition',
        effects: { preferencie: 0.5 },
      },
    ],
  },
  {
    id: 'kuponka',
    titleSk: 'Kupónka',
    bodySk:
      'Druhá vlna kupónov, alebo priamy predaj sponzorom? Občania počítajú knižky, fondy čakajú.',
    year: 1993,
    quarter: 3,
    factId: 'fact-kuponka',
    choices: [
      {
        id: 'continue-wave',
        labelSk: 'Pokračovať v kupónovej vlne',
        role: 'government',
        effects: { preferencie: 0.9, patronagePower: 'limited' },
      },
      {
        id: 'cancel-wave',
        labelSk: 'Zrušiť vlnu, ísť do priamych predajov',
        role: 'government',
        effects: {
          preferencie: -0.4,
          patronagePower: 'full',
          trustDebt: 1,
        },
      },
      {
        id: 'organize',
        labelSk: 'Kritizovať rozpredaj v teréne',
        role: 'opposition',
        effects: { preferencie: 0.6, reputacia: 0.3 },
      },
    ],
  },
  {
    id: 'pad-vlady',
    titleSk: 'Pád vlády',
    bodySk: 'Defekcia v parlamente. Koalícia sa trasie, alebo sa trhá.',
    year: 1994,
    quarter: 1,
    factId: 'fact-pad-vlady',
    choices: [
      {
        id: 'watch-collapse',
        labelSk: 'Skúsiť udržať väčšinu',
        role: 'government',
        effects: { koalicia: -25, preferencie: -0.5 },
      },
      {
        id: 'exploit-crisis',
        labelSk: 'Tlačiť na predčasné voľby',
        role: 'opposition',
        effects: { preferencie: 1.0, reputacia: 0.4 },
      },
    ],
  },
  {
    id: 'volby-94-stub',
    titleSk: 'Voľby ’94 (náznak)',
    bodySk: 'Kampaň sa blíži. Plný volebný boss príde neskôr; zatiaľ len náznak.',
    year: 1994,
    quarter: 3,
    factId: 'fact-volby-94-stub',
    choices: [
      {
        id: 'brace-election',
        labelSk: 'Pripraviť stranícky aparát',
        role: 'government',
        effects: { preferencie: 0.3 },
      },
      {
        id: 'mobilize',
        labelSk: 'Mobilizovať základňu',
        role: 'opposition',
        effects: { preferencie: 0.5 },
      },
    ],
  },
]

export const timelineEventsById = Object.fromEntries(
  timelineEvents.map((event) => [event.id, event]),
) as Record<EventId, TimelineEvent>

export function eventIdForQuarter(year: number, quarter: number): EventId | null {
  const hit = timelineEvents.find((event) => event.year === year && event.quarter === quarter)
  return hit?.id ?? null
}
