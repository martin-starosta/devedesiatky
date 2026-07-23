import {
  defaultDealConditions,
  detonationSwing,
  mediaMuteThreshold,
  mutePreferencieFactor,
  muteReputaciaCost,
  type KauzaCondition,
  type KauzaStatus,
} from '../content/kauzy'
import type { CompanyId, GameState, KauzaEntry, SponsorId, Quarter } from './types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function createKauzaEntry(input: {
  companyId: CompanyId
  sponsorId: SponsorId
  year: number
  quarter: Quarter
  pressure: number
  conditions?: KauzaCondition[]
}): KauzaEntry {
  return {
    id: `${input.companyId}:${input.sponsorId}:${input.year}Q${input.quarter}`,
    companyId: input.companyId,
    sponsorId: input.sponsorId,
    year: input.year,
    quarter: input.quarter,
    pressure: input.pressure,
    conditions: input.conditions ?? [...defaultDealConditions],
    status: 'latent',
  }
}

function activePressure(kauzy: KauzaEntry[]): number {
  return round1(
    kauzy
      .filter((k) => k.status === 'latent' || k.status === 'muted')
      .reduce((sum, k) => sum + k.pressure, 0),
  )
}

function canMute(state: GameState): boolean {
  return state.media >= mediaMuteThreshold
}

function applyEntryOutcome(
  state: GameState,
  entryId: string,
  status: Extract<KauzaStatus, 'muted' | 'detonated'>,
): GameState {
  const entry = state.kauzy.find((k) => k.id === entryId)
  if (!entry || entry.status === 'detonated' || entry.status === 'muted') {
    return state
  }

  const preferencieHit =
    status === 'muted'
      ? entry.pressure * detonationSwing.preferencie * mutePreferencieFactor
      : entry.pressure * detonationSwing.preferencie
  const reputaciaHit =
    status === 'muted'
      ? muteReputaciaCost
      : entry.pressure * detonationSwing.reputacia

  const kauzy = state.kauzy.map((k) => (k.id === entryId ? { ...k, status } : k))
  return {
    ...state,
    kauzy,
    kauzyPressure: activePressure(kauzy),
    preferencie: round1(state.preferencie - preferencieHit),
    reputacia: round1(state.reputacia - reputaciaHit),
  }
}

/** Resolve latent entries tagged with `condition` (mute via Médiá when possible). */
export function fireKauzaCondition(
  state: GameState,
  condition: KauzaCondition,
): GameState {
  let next = state
  for (const entry of state.kauzy) {
    if (entry.status !== 'latent') continue
    if (!entry.conditions.includes(condition)) continue
    const status = canMute(next) ? 'muted' : 'detonated'
    next = applyEntryOutcome(next, entry.id, status)
  }
  return next
}

/**
 * Loss of power: archives open. Marks hostile ledger and fires lossOfPower tags.
 * Mute is intentionally unavailable here (hostile hands hold the files).
 */
export function openHostileLedger(state: GameState): GameState {
  if (state.hostileLedger) {
    return state
  }
  let next: GameState = {
    ...state,
    hostileLedger: true,
  }
  for (const entry of [...next.kauzy]) {
    if (entry.status !== 'latent') continue
    if (!entry.conditions.includes('lossOfPower')) continue
    next = applyEntryOutcome(next, entry.id, 'detonated')
  }
  return next
}

/** Hook for government collapse / leaving office (call after inGovernment is false). */
export function onLostPower(state: GameState): GameState {
  if (state.inGovernment || state.hostileLedger) {
    return state
  }
  return openHostileLedger(state)
}

export function initialKauzyFields(): Pick<GameState, 'hostileLedger'> {
  return { hostileLedger: false }
}
