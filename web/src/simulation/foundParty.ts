import {
  demographicIdeals,
  demographicPoolIds,
  freeFoundingDefaults,
  partyPresets,
} from '../content/partyFounding'
import { openPeniazePhase } from './patronage'
import type {
  DemographicWeights,
  GameAction,
  GameState,
  Ideology,
  PartyPresetId,
  Rng,
} from './types'

function clampIdeology(value: number): number {
  return Math.max(-1, Math.min(1, value))
}

export const neutralIdeology: Ideology = {
  narodnyObciansky: 0,
  socialnyTrhovy: 0,
  vychodZapad: 0,
}

function normalizeIdeology(ideology: Ideology): Ideology {
  return {
    narodnyObciansky: clampIdeology(ideology.narodnyObciansky),
    socialnyTrhovy: clampIdeology(ideology.socialnyTrhovy),
    vychodZapad: clampIdeology(ideology.vychodZapad),
  }
}

function ideologyDistance(a: Ideology, b: Ideology): number {
  const dn = a.narodnyObciansky - b.narodnyObciansky
  const ds = a.socialnyTrhovy - b.socialnyTrhovy
  const dv = a.vychodZapad - b.vychodZapad
  return Math.sqrt(dn * dn + ds * ds + dv * dv)
}

/** Softmax-ish weights from ideology distance to demographic ideals. */
export function weightsFromIdeology(ideology: Ideology): DemographicWeights {
  const affinities = demographicPoolIds.map((id) => {
    const distance = ideologyDistance(ideology, demographicIdeals[id])
    return { id, score: Math.exp(-distance) }
  })
  const total = affinities.reduce((sum, row) => sum + row.score, 0)
  const weights = {} as DemographicWeights
  for (const row of affinities) {
    weights[row.id] = row.score / total
  }
  return weights
}

/** Preferencie in the 8–12% band, deterministic from RNG. */
function rollPreferencie(rng: Rng, base: number): number {
  const jitter = (rng.next() - 0.5) * 2 // -1…1
  const value = base + jitter
  return Math.round(Math.max(8, Math.min(12, value)) * 10) / 10
}

function resolveFounding(
  action: Extract<GameAction, { type: 'FOUND_PARTY' }>,
  rng: Rng,
): {
  ideology: Ideology
  preferencie: number
  pokladna: number
  offices: number
  presetId: PartyPresetId | null
  inGovernment: boolean
} {
  if (action.preset) {
    const preset = partyPresets[action.preset]
    return {
      ideology: normalizeIdeology(action.ideology ?? preset.ideology),
      preferencie: preset.preferencie,
      pokladna: preset.pokladna,
      offices: preset.offices,
      presetId: preset.id,
      // Stroj moci starts in government; challenger starts in opposition.
      inGovernment: action.preset === 'hnutie-machine',
    }
  }

  const ideology = normalizeIdeology(action.ideology ?? neutralIdeology)
  return {
    ideology,
    preferencie: rollPreferencie(rng, freeFoundingDefaults.preferencie),
    pokladna: freeFoundingDefaults.pokladna,
    offices: freeFoundingDefaults.offices,
    presetId: null,
    // Free founding defaults to government so the patronage thesis is playable.
    inGovernment: true,
  }
}

export function applyFoundParty(
  state: GameState,
  action: Extract<GameAction, { type: 'FOUND_PARTY' }>,
  rng: Rng,
): GameState {
  if (state.phase !== 'setup') {
    return state
  }

  const founded = resolveFounding(action, rng)
  const playing: GameState = {
    ...state,
    phase: 'playing',
    ideology: founded.ideology,
    preferencie: founded.preferencie,
    pokladna: founded.pokladna,
    offices: founded.offices,
    demographicWeights: weightsFromIdeology(founded.ideology),
    presetId: founded.presetId,
    inGovernment: founded.inGovernment,
    rngState: rng.state,
  }

  if (!founded.inGovernment) {
    return { ...playing, turnPhase: 'centrala' }
  }
  return openPeniazePhase(playing, rng)
}
