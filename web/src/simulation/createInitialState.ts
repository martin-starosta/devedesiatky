import { mvp1ClockStub } from '../content/mvp1ClockStub'
import { createBootstrapState } from './createBootstrapState'
import { applyFinishPeniaze } from './patronage'
import { createRng } from './rng'
import { reduce } from './reduce'
import type { GameState, Ideology, PartyPresetId, Quarter } from './types'

type InitialOptions = {
  seed: number
  year?: number
  quarter?: Quarter
  preferencie?: number
  ideology?: Ideology
  preset?: PartyPresetId
  /** Keep the post-founding Peniaze FNM offer open (patronage fixtures). */
  openPeniaze?: boolean
}

/**
 * Test/helper: bootstrap + FOUND_PARTY so fixtures start in a playing run.
 * Production UI should dispatch FOUND_PARTY from setup instead.
 */
export function createInitialState(options: InitialOptions): GameState {
  const boot = createBootstrapState({ seed: options.seed })
  let founded = reduce(
    boot,
    {
      type: 'FOUND_PARTY',
      ideology: options.ideology,
      preset: options.preset,
    },
    createRng(boot.rngState),
  )

  founded = {
    ...founded,
    year: options.year ?? founded.year,
    quarter: options.quarter ?? founded.quarter,
    preferencie: options.preferencie ?? founded.preferencie ?? mvp1ClockStub.startPreferencie,
  }

  if (!options.openPeniaze && founded.turnPhase === 'peniaze') {
    return applyFinishPeniaze(founded)
  }
  return founded
}
