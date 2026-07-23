import {
  companies,
  companyIds,
  fnmOfferCount,
  sponsors,
  type CompanyId,
} from '../content/patronage'
import type {
  GameAction,
  GameState,
  KauzaEntry,
  Rng,
  SponsorId,
} from './types'

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

function cashForDeal(companyId: CompanyId, sponsorId: SponsorId): number {
  const company = companies[companyId]
  const sponsor = sponsors[sponsorId]
  return Math.round(company.bookValue * sponsor.generosity)
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
    preferencie: Math.round((state.preferencie + swing) * 10) / 10,
    rngState: rng.state,
  }
}

export function applyAssignToSponsor(
  state: GameState,
  action: Extract<GameAction, { type: 'ASSIGN_TO_SPONSOR' }>,
  rng: Rng,
): GameState {
  if (
    state.phase !== 'playing' ||
    !state.inGovernment ||
    state.turnPhase !== 'peniaze' ||
    !state.fnmOffered.includes(action.companyId) ||
    !(action.sponsorId in sponsors)
  ) {
    return state
  }

  const cash = cashForDeal(action.companyId, action.sponsorId)
  const pressure = pressureForDeal(action.companyId, action.sponsorId)
  const entry: KauzaEntry = {
    id: `${action.companyId}:${action.sponsorId}:${state.year}Q${state.quarter}`,
    companyId: action.companyId,
    sponsorId: action.sponsorId,
    year: state.year,
    quarter: state.quarter,
    pressure,
  }

  const fnmOffered = state.fnmOffered.filter((id) => id !== action.companyId)
  const afterDeal: GameState = {
    ...state,
    pokladna: state.pokladna + cash,
    kauzy: [...state.kauzy, entry],
    kauzyPressure: Math.round((state.kauzyPressure + pressure) * 10) / 10,
    fnmOffered,
    fnmAssigned: { ...state.fnmAssigned, [action.companyId]: action.sponsorId },
  }

  const afterPoll = applyPollTickAfterPatronage(afterDeal, cash, rng)
  if (fnmOffered.length === 0) {
    return { ...afterPoll, turnPhase: 'centrala' }
  }
  return afterPoll
}

export function applyFinishPeniaze(state: GameState): GameState {
  if (state.phase !== 'playing' || state.turnPhase !== 'peniaze') {
    return state
  }
  return {
    ...state,
    turnPhase: 'centrala',
    // Unused offers return to the pool for a later quarter.
    fnmPool: [...state.fnmPool, ...state.fnmOffered],
    fnmOffered: [],
  }
}

export function initialPatronageFields(inGovernment: boolean): Pick<
  GameState,
  | 'inGovernment'
  | 'fnmPool'
  | 'fnmOffered'
  | 'fnmAssigned'
  | 'kauzy'
  | 'kauzyPressure'
  | 'turnPhase'
> {
  return {
    inGovernment,
    fnmPool: [...companyIds],
    fnmOffered: [],
    fnmAssigned: {},
    kauzy: [],
    kauzyPressure: 0,
    turnPhase: 'centrala',
  }
}
