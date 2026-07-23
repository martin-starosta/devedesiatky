import { mvp1ClockStub } from '../content/mvp1ClockStub'
import { createBootstrapState } from './createBootstrapState'
import { applyFinishPeniaze } from './patronage'
import { applyFinishPolitika } from './politika'
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
  /** Keep Politika phase open (politika fixtures). */
  openPolitika?: boolean
  /** Skip to open Peniaze FNM offer (patronage fixtures). */
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

  if (options.openPolitika) {
    return founded
  }

  if (founded.turnPhase === 'politika') {
    founded = applyFinishPolitika(founded, createRng(founded.rngState))
  }

  if (options.openPeniaze) {
    return founded
  }

  if (founded.turnPhase === 'peniaze') {
    founded = applyFinishPeniaze(founded, createRng(founded.rngState))
  }

  // Fixtures skip event/fact/election overlays unless a suite opens them explicitly.
  if (
    founded.turnPhase === 'event' ||
    founded.turnPhase === 'fact' ||
    founded.turnPhase === 'volby-kampan' ||
    founded.turnPhase === 'volby-noc' ||
    founded.turnPhase === 'volby-koalicia' ||
    founded.turnPhase === 'volby-noc-nozo'
  ) {
    founded = {
      ...founded,
      turnPhase: 'centrala',
      activeEventId: null,
      pendingFactId: null,
      election: null,
    }
  }

  return founded
}
