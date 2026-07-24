export type RelicId = 'statna-tv' | 'sis' | 'ustavna-vacina'

export type RelicDef = {
  id: RelicId
  titleSk: string
  blurbSk: string
}

export const relics: Record<RelicId, RelicDef> = {
  'statna-tv': {
    id: 'statna-tv',
    titleSk: 'Štátna TV',
    blurbSk: 'Kult karty stoja o 1 menej. +1 Médiá pri získaní.',
  },
  sis: {
    id: 'sis',
    titleSk: 'SIS',
    blurbSk: 'Raz za akt vyhostiť kauzu z ruky — +Pozornosť pre bossov.',
  },
  'ustavna-vacina': {
    id: 'ustavna-vacina',
    titleSk: 'Ústavná väčšina',
    blurbSk: 'Veľkosť ruky 6, kým ju držíš.',
  },
}

export const actIRelicIds = Object.keys(relics) as RelicId[]

/** Odpočinok: max card removals per act (kauza removal counts as a full use). */
export const restRemovesPerAct = 2
