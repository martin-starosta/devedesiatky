import {
  companies,
  companyIds,
  fnmEffects,
  fnmOfferCount,
  sponsors,
  type CompanyId,
} from '../content/patronage'
import { openEventOrCentrala } from './events'
import { runNpcOppositionPeniaze } from './npcAi'
import type {
  FnmAssignment,
  GameAction,
  GameState,
  KauzaEntry,
  Rng,
  SponsorId,
} from './types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function dealFnmOffer(pool: CompanyId[], rng: Rng): { offered: CompanyId[]; pool: CompanyId[] } {
  const remaining = [...pool]
  const maxOffer = Math.min(fnmOfferCount.max, remaining.length)
  const minOffer = Math.min(fnmOfferCount.min, maxOffer)
  if (maxOffer === 0) {
    return { offered: [], pool: remaining }
  }
  const count =
    minOffer === maxOffer
      ? minOffer
      : minOffer + Math.floor(rng.next() * (maxOffer - minOffer + 1))

  const offered: CompanyId[] = []
  for (let i = 0; i < count; i += 1) {
    const index = Math.floor(rng.next() * remaining.length)
    offered.push(remaining.splice(index, 1)[0])
  }
  return { offered, pool: remaining }
}

/** Open a government Peniaze phase with a fresh FNM offer from the pool. */
export function openPeniazePhase(state: GameState, rng: Rng): GameState {
  if (!state.inGovernment || state.fnmPool.length === 0) {
    return {
      ...state,
      turnPhase: 'centrala',
      fnmOffered: [],
      rngState: rng.state,
    }
  }
  const dealt = dealFnmOffer(state.fnmPool, rng)
  return {
    ...state,
    turnPhase: 'peniaze',
    fnmPool: dealt.pool,
    fnmOffered: dealt.offered,
    rngState: rng.state,
  }
}

function cashForDeal(
  companyId: CompanyId,
  sponsorId: SponsorId,
  patronagePower: GameState['patronagePower'],
): number {
  const company = companies[companyId]
  const sponsor = sponsors[sponsorId]
  const raw = company.bookValue * sponsor.generosity
  const factor = patronagePower === 'full' ? 1 : 0.45
  return Math.round(raw * factor)
}

function pressureForDeal(companyId: CompanyId, sponsorId: SponsorId): number {
  const company = companies[companyId]
  const sponsor = sponsors[sponsorId]
  return Math.round((company.bookValue / 100_000) * sponsor.riskiness * 10) / 10
}

function pollSwingFromPatronage(cash: number, rng: Rng): number {
  const base = cash / 200_000
  const jitter = (rng.next() - 0.5) * 0.4
  return Math.round((base + jitter) * 10) / 10
}

/** Dirty money buys a short Preferencie bump; size scales with cash, jitter from RNG. */
export function applyPollTickAfterPatronage(
  state: GameState,
  cash: number,
  rng: Rng,
): GameState {
  const swing = pollSwingFromPatronage(cash, rng)
  return {
    ...state,
    preferencie: round1(state.preferencie + swing),
    rngState: rng.state,
  }
}

function takeCompanyOffOffer(state: GameState, companyId: CompanyId): CompanyId[] {
  return state.fnmOffered.filter((id) => id !== companyId)
}

/** Pád vlády: Koalícia ≤ 0 strips government and ends Peniaze. */
export function applyCoalitionCollapse(state: GameState): GameState {
  if (state.koalicia > 0 || !state.inGovernment) {
    return state
  }
  return {
    ...state,
    inGovernment: false,
    koalicia: 0,
    turnPhase: 'centrala',
    fnmPool: [...state.fnmPool, ...state.fnmOffered],
    fnmOffered: [],
  }
}

function maybeEndPeniaze(
  state: GameState,
  remainingOffers: CompanyId[],
  rng: Rng,
): GameState {
  if (remainingOffers.length === 0 && state.turnPhase === 'peniaze') {
    const cleared = { ...state, fnmOffered: remainingOffers }
    const afterNpc = runNpcOppositionPeniaze(cleared, rng)
    return openEventOrCentrala(afterNpc)
  }
  return { ...state, fnmOffered: remainingOffers }
}

export function applyAssignFnm(
  state: GameState,
  action: Extract<GameAction, { type: 'ASSIGN_FNM' }>,
  rng: Rng,
): GameState {
  if (
    state.phase !== 'playing' ||
    !state.inGovernment ||
    state.turnPhase !== 'peniaze' ||
    !state.fnmOffered.includes(action.companyId)
  ) {
    return state
  }

  const { companyId, destination } = action
  const remaining = takeCompanyOffOffer(state, companyId)

  if (destination.kind === 'sponsor') {
    if (!(destination.sponsorId in sponsors)) {
      return state
    }
    const cash = cashForDeal(companyId, destination.sponsorId, state.patronagePower)
    const pressure = pressureForDeal(companyId, destination.sponsorId)
    const entry: KauzaEntry = {
      id: `${companyId}:${destination.sponsorId}:${state.year}Q${state.quarter}`,
      companyId,
      sponsorId: destination.sponsorId,
      year: state.year,
      quarter: state.quarter,
      pressure,
    }
    const assignment: FnmAssignment = destination
    const afterDeal: GameState = {
      ...state,
      pokladna: state.pokladna + cash,
      kauzy: [...state.kauzy, entry],
      kauzyPressure: round1(state.kauzyPressure + pressure),
      fnmAssigned: { ...state.fnmAssigned, [companyId]: assignment },
      fnmOffered: remaining,
    }
    const afterPoll = applyPollTickAfterPatronage(afterDeal, cash, rng)
    return maybeEndPeniaze(afterPoll, remaining, rng)
  }

  if (destination.kind === 'partner') {
    rng.next()
    const next: GameState = {
      ...state,
      koalicia: round1(state.koalicia + fnmEffects.partner.koalicia),
      fnmAssigned: { ...state.fnmAssigned, [companyId]: destination },
      fnmOffered: remaining,
      rngState: rng.state,
    }
    return applyCoalitionCollapse(maybeEndPeniaze(next, remaining, rng))
  }

  if (destination.kind === 'auction') {
    rng.next()
    const next: GameState = {
      ...state,
      reputacia: round1(state.reputacia + fnmEffects.auction.reputacia),
      koalicia: round1(state.koalicia + fnmEffects.auction.koalicia),
      fnmAssigned: { ...state.fnmAssigned, [companyId]: destination },
      fnmOffered: remaining,
      rngState: rng.state,
    }
    return applyCoalitionCollapse(maybeEndPeniaze(next, remaining, rng))
  }

  // cancel / delay: political cost, company returns to the pool
  rng.next()
  const next: GameState = {
    ...state,
    preferencie: round1(state.preferencie + fnmEffects.cancel.preferencie),
    koalicia: round1(state.koalicia + fnmEffects.cancel.koalicia),
    fnmPool: [...state.fnmPool, companyId],
    fnmAssigned: { ...state.fnmAssigned, [companyId]: destination },
    fnmOffered: remaining,
    rngState: rng.state,
  }
  return applyCoalitionCollapse(maybeEndPeniaze(next, remaining, rng))
}

export function applyAssignToSponsor(
  state: GameState,
  action: Extract<GameAction, { type: 'ASSIGN_TO_SPONSOR' }>,
  rng: Rng,
): GameState {
  return applyAssignFnm(
    state,
    {
      type: 'ASSIGN_FNM',
      companyId: action.companyId,
      destination: { kind: 'sponsor', sponsorId: action.sponsorId },
    },
    rng,
  )
}

export function applyFinishPeniaze(state: GameState, rng: Rng): GameState {
  if (state.phase !== 'playing' || state.turnPhase !== 'peniaze') {
    return state
  }
  const cleared: GameState = {
    ...state,
    fnmPool: [...state.fnmPool, ...state.fnmOffered],
    fnmOffered: [],
  }
  const afterNpc = runNpcOppositionPeniaze(cleared, rng)
  return openEventOrCentrala(afterNpc)
}

export function initialPatronageFields(inGovernment: boolean): Pick<
  GameState,
  | 'inGovernment'
  | 'koalicia'
  | 'fnmPool'
  | 'fnmOffered'
  | 'fnmAssigned'
  | 'kauzy'
  | 'kauzyPressure'
  | 'turnPhase'
> {
  return {
    inGovernment,
    koalicia: inGovernment ? fnmEffects.startingKoalicia : 0,
    fnmPool: [...companyIds],
    fnmOffered: [],
    fnmAssigned: {},
    kauzy: [],
    kauzyPressure: 0,
    turnPhase: 'centrala',
  }
}
