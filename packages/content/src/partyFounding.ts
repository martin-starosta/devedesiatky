/** Each ideology axis is -1 … +1. */
export type Ideology = {
  narodnyObciansky: number
  socialnyTrhovy: number
  vychodZapad: number
}

export type PartyPresetId = 'hnutie-machine' | 'challenger'

export type PartyPreset = {
  id: PartyPresetId
  labelSk: string
  blurbSk: string
  ideology: Ideology
  preferencie: number
  pokladna: number
  offices: number
}

export const demographicPoolIds = [
  'narodovci',
  'mestania',
  'robotnici',
  'podnikatelia',
  'zapadniari',
  'vychodniari',
] as const

/** Ideal ideology vectors for each demographic pool (content-tunable). */
export const demographicIdeals: Record<
  (typeof demographicPoolIds)[number],
  Ideology
> = {
  narodovci: { narodnyObciansky: -0.8, socialnyTrhovy: 0, vychodZapad: -0.3 },
  mestania: { narodnyObciansky: 0.7, socialnyTrhovy: 0.2, vychodZapad: 0.5 },
  robotnici: { narodnyObciansky: -0.1, socialnyTrhovy: -0.7, vychodZapad: -0.2 },
  podnikatelia: { narodnyObciansky: 0.3, socialnyTrhovy: 0.8, vychodZapad: 0.4 },
  zapadniari: { narodnyObciansky: 0.5, socialnyTrhovy: 0.3, vychodZapad: 0.9 },
  vychodniari: { narodnyObciansky: -0.4, socialnyTrhovy: -0.2, vychodZapad: -0.8 },
}

export const partyPresets: Record<PartyPresetId, PartyPreset> = {
  'hnutie-machine': {
    id: 'hnutie-machine',
    labelSk: 'Stroj moci',
    blurbSk: 'Silná preferencia, viac kancelárií. Udržať vládu.',
    ideology: {
      narodnyObciansky: -0.55,
      socialnyTrhovy: -0.15,
      vychodZapad: -0.45,
    },
    preferencie: 12,
    pokladna: 180_000,
    offices: 5,
  },
  challenger: {
    id: 'challenger',
    labelSk: 'Malý vyzývateľ',
    blurbSk: 'Tenký rozpočet, tri kancelárie. Dobýjať zdola.',
    ideology: {
      narodnyObciansky: 0.45,
      socialnyTrhovy: 0.25,
      vychodZapad: 0.55,
    },
    preferencie: 8,
    pokladna: 25_000,
    offices: 3,
  },
}

/** Defaults when founding from free sliders (no preset). */
export const freeFoundingDefaults = {
  preferencie: 10,
  pokladna: 40_000,
  offices: 3,
}
