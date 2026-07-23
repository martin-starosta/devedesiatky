import { mvp1ClockStub } from '../content/mvp1ClockStub'
import type { GameState, Quarter } from './types'

type InitialOptions = {
  seed: number
  year?: number
  quarter?: Quarter
  preferencie?: number
}

/** Stub starting position for MVP1 clock — full party founding lands in a later slice. */
export function createInitialState(options: InitialOptions): GameState {
  const seed = options.seed >>> 0
  return {
    seed,
    rngState: seed,
    year: options.year ?? mvp1ClockStub.startYear,
    quarter: options.quarter ?? mvp1ClockStub.startQuarter,
    preferencie: options.preferencie ?? mvp1ClockStub.startPreferencie,
  }
}
