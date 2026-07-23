import { mvp1ClockStub } from '../content/mvp1ClockStub'
import { createBootstrapState } from './createBootstrapState'
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
}

/**
 * Test/helper: bootstrap + FOUND_PARTY so clock fixtures start in a playing run.
 * Production UI should dispatch FOUND_PARTY from setup instead.
 */
export function createInitialState(options: InitialOptions): GameState {
  const boot = createBootstrapState({ seed: options.seed })
  const founded = reduce(
    boot,
    {
      type: 'FOUND_PARTY',
      ideology: options.ideology,
      preset: options.preset,
    },
    createRng(boot.rngState),
  )

  return {
    ...founded,
    year: options.year ?? founded.year,
    quarter: options.quarter ?? founded.quarter,
    preferencie: options.preferencie ?? founded.preferencie ?? mvp1ClockStub.startPreferencie,
  }
}
