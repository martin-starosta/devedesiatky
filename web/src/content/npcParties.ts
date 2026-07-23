/** Fictional MVP1 archetypes; real names stay off the stage. */
export type NpcArchetypeId = 'hnutie' | 'narodniari' | 'lavica' | 'robotnici'

export type UtilityWeights = {
  preferencie: number
  reputacia: number
  media: number
  pokladna: number
  /** Positive = tolerate Kauzy; negative = avoid dirty cash. */
  kauzyPressure: number
}

export type NpcArchetype = {
  id: NpcArchetypeId
  labelSk: string
  blurbSk: string
  /** CSS color token for Snem arcs */
  color: string
  startingPreferencie: number
  weights: UtilityWeights
}

export const npcArchetypes: Record<NpcArchetypeId, NpcArchetype> = {
  hnutie: {
    id: 'hnutie',
    labelSk: 'Hnutie',
    blurbSk: 'Populistický stroj. Preferencie a médiá nad všetko.',
    color: '#c8102e',
    startingPreferencie: 16,
    weights: {
      preferencie: 1.4,
      reputacia: -0.4,
      media: 1.6,
      pokladna: 1.5,
      kauzyPressure: 0.8,
    },
  },
  narodniari: {
    id: 'narodniari',
    labelSk: 'Národniari',
    blurbSk: 'Hlasití. Lacný partner, drahá reputácia.',
    color: '#5b7c99',
    startingPreferencie: 9,
    weights: {
      preferencie: 1.5,
      reputacia: -0.9,
      media: 0.7,
      pokladna: 0.6,
      kauzyPressure: 0.3,
    },
  },
  lavica: {
    id: 'lavica',
    labelSk: 'Ľavica',
    blurbSk: 'Stabilná základňa. Pomalá, dbá na kredit.',
    color: '#b8d4a8',
    startingPreferencie: 11,
    weights: {
      preferencie: 0.5,
      reputacia: 1.7,
      media: 0.2,
      pokladna: 0.3,
      kauzyPressure: -1.2,
    },
  },
  robotnici: {
    id: 'robotnici',
    labelSk: 'Robotnícka strana',
    blurbSk: 'Protestný hlas. Chaos a krátkodobé body.',
    color: '#f5c518',
    startingPreferencie: 10,
    weights: {
      preferencie: 1.8,
      reputacia: 0.1,
      media: 0.4,
      pokladna: 0.5,
      kauzyPressure: -0.2,
    },
  },
}

