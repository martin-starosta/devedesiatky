import { mvp1ClockStub } from '../content/mvp1ClockStub'
import { initialEventFields } from './events'
import { neutralIdeology } from './foundParty'
import { initialKauzyFields } from './kauzy'
import { initialNpcFields } from './npcRoster'
import { initialPatronageFields } from './patronage'
import { initialPolitikaFields } from './politika'
import { initialElectionFields } from './volby94'
import type { DemographicWeights, GameState } from './types'

const emptyWeights: DemographicWeights = {
  narodovci: 0,
  mestania: 0,
  robotnici: 0,
  podnikatelia: 0,
  zapadniari: 0,
  vychodniari: 0,
}

/** Pre-founding lobby state — resources land via FOUND_PARTY. */
export function createBootstrapState(options: { seed: number }): GameState {
  const seed = options.seed >>> 0
  return {
    seed,
    rngState: seed,
    phase: 'setup',
    year: mvp1ClockStub.startYear,
    quarter: mvp1ClockStub.startQuarter,
    preferencie: 0,
    pokladna: 0,
    offices: 0,
    ideology: { ...neutralIdeology },
    demographicWeights: emptyWeights,
    presetId: null,
    ...initialPatronageFields(false),
    ...initialPolitikaFields(),
    ...initialEventFields(),
    ...initialNpcFields(),
    ...initialKauzyFields(),
    ...initialElectionFields(),
  }
}
