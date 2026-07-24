import { companies, sponsors, type CompanyId, type SponsorId } from '@devedesiatky/content'
import { npcArchetypes, type NpcArchetypeId } from '@devedesiatky/content'
import { politikaActions, type PolitikaActionId } from '@devedesiatky/content'
import { availablePolitikaActions } from './politikaAvailable'
import type { FnmDestination, GameState, PatronagePower, Rng } from './types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function scorePolitika(
  archetypeId: NpcArchetypeId,
  actionId: PolitikaActionId,
): number {
  const weights = npcArchetypes[archetypeId].weights
  const effects = politikaActions[actionId].effects
  return (
    weights.preferencie * (effects.preferencie ?? 0) +
    weights.reputacia * (effects.reputacia ?? 0) +
    weights.media * (effects.media ?? 0)
  )
}

/** Pure pick: highest utility among legal Politika actions for this role. */
export function pickNpcPolitikaAction(input: {
  archetypeId: NpcArchetypeId
  inGovernment: boolean
}): PolitikaActionId {
  const legal = availablePolitikaActions(input.inGovernment)
  let best = legal[0]
  let bestScore = Number.NEGATIVE_INFINITY
  for (const actionId of legal) {
    const score = scorePolitika(input.archetypeId, actionId)
    if (score > bestScore) {
      bestScore = score
      best = actionId
    }
  }
  return best
}

export type NpcPeniazeActionId = 'street-fundraise' | 'denounce-deal' | 'quiet-build'

const npcPeniazeActions: Record<
  NpcPeniazeActionId,
  { preferencie: number; pokladna: number }
> = {
  'street-fundraise': { preferencie: 0.15, pokladna: 15_000 },
  'denounce-deal': { preferencie: 0.7, pokladna: 0 },
  'quiet-build': { preferencie: 0.1, pokladna: 6_000 },
}

export function pickNpcPeniazeAction(archetypeId: NpcArchetypeId): NpcPeniazeActionId {
  const w = npcArchetypes[archetypeId].weights
  const ids = Object.keys(npcPeniazeActions) as NpcPeniazeActionId[]
  let best = ids[0]
  let bestScore = Number.NEGATIVE_INFINITY
  for (const id of ids) {
    const effects = npcPeniazeActions[id]
    const score =
      w.preferencie * effects.preferencie + w.pokladna * (effects.pokladna / 20_000)
    if (score > bestScore) {
      bestScore = score
      best = id
    }
  }
  return best
}

function cashForDeal(
  companyId: CompanyId,
  sponsorId: SponsorId,
  patronagePower: PatronagePower,
): number {
  const raw = companies[companyId].bookValue * sponsors[sponsorId].generosity
  const factor = patronagePower === 'full' ? 1 : 0.45
  return Math.round(raw * factor)
}

function pressureForDeal(companyId: CompanyId, sponsorId: SponsorId): number {
  return (
    Math.round(
      (companies[companyId].bookValue / 100_000) * sponsors[sponsorId].riskiness * 10,
    ) / 10
  )
}

function scoreDestination(
  archetypeId: NpcArchetypeId,
  companyId: CompanyId,
  destination: FnmDestination,
  patronagePower: PatronagePower,
): number {
  const w = npcArchetypes[archetypeId].weights
  if (destination.kind === 'sponsor') {
    const cash = cashForDeal(companyId, destination.sponsorId, patronagePower)
    const pressure = pressureForDeal(companyId, destination.sponsorId)
    return w.pokladna * (cash / 100_000) + w.kauzyPressure * pressure
  }
  if (destination.kind === 'partner') {
    return w.reputacia * 0.2 + w.preferencie * 0.1
  }
  if (destination.kind === 'auction') {
    return w.reputacia * 0.8 + w.pokladna * 0.2
  }
  return w.reputacia * 0.5 + w.kauzyPressure * -0.5
}

const sponsorIds = Object.keys(sponsors) as SponsorId[]

export function pickNpcPeniazeDestination(input: {
  archetypeId: NpcArchetypeId
  companyId: CompanyId
  patronagePower: PatronagePower
}): FnmDestination {
  const candidates: FnmDestination[] = [
    ...sponsorIds.map((sponsorId) => ({ kind: 'sponsor' as const, sponsorId })),
    { kind: 'partner' },
    { kind: 'auction' },
    { kind: 'cancel' },
  ]
  let best = candidates[0]
  let bestScore = Number.NEGATIVE_INFINITY
  for (const destination of candidates) {
    const score = scoreDestination(
      input.archetypeId,
      input.companyId,
      destination,
      input.patronagePower,
    )
    if (score > bestScore) {
      bestScore = score
      best = destination
    }
  }
  return best
}

function applyPolitikaToNpc(
  state: GameState,
  npcIndex: number,
  actionId: PolitikaActionId,
): GameState {
  const effects = politikaActions[actionId].effects
  const parties = state.npcParties.map((npc, i) => {
    if (i !== npcIndex) return npc
    return {
      ...npc,
      preferencie: round1(npc.preferencie + (effects.preferencie ?? 0)),
    }
  })
  return {
    ...state,
    npcParties: parties,
    reputacia: round1(state.reputacia + (effects.reputacia ?? 0) * 0.35),
    media: round1(state.media + (effects.media ?? 0) * 0.35),
  }
}

/** Each NPC spends one Politika action scored by archetype weights. */
export function runNpcPolitika(state: GameState, rng: Rng): GameState {
  if (state.phase !== 'playing' || state.npcParties.length === 0) {
    return state
  }
  let next = state
  for (let i = 0; i < next.npcParties.length; i += 1) {
    rng.next()
    const npc = next.npcParties[i]
    const actionId = pickNpcPolitikaAction({
      archetypeId: npc.id,
      inGovernment: npc.inGovernment,
    })
    next = applyPolitikaToNpc(next, i, actionId)
  }
  return { ...next, rngState: rng.state }
}

/**
 * Governing NPC bloc deals the FNM offer and assigns each company by utility.
 * Used when the player is in opposition.
 */
export function runNpcGovernmentPeniaze(state: GameState, rng: Rng): GameState {
  const govNpc = state.npcParties.find((p) => p.inGovernment)
  if (!govNpc || state.inGovernment || state.fnmPool.length === 0) {
    return state
  }

  const remaining = [...state.fnmPool]
  const offerCount = Math.min(2, remaining.length)
  const offered: CompanyId[] = []
  for (let i = 0; i < offerCount; i += 1) {
    const index = Math.floor(rng.next() * remaining.length)
    offered.push(remaining.splice(index, 1)[0])
  }

  let next: GameState = {
    ...state,
    fnmPool: remaining,
    fnmOffered: offered,
    rngState: rng.state,
  }

  for (const companyId of offered) {
    const destination = pickNpcPeniazeDestination({
      archetypeId: govNpc.id,
      companyId,
      patronagePower: next.patronagePower,
    })
    if (destination.kind === 'sponsor') {
      const cash = cashForDeal(companyId, destination.sponsorId, next.patronagePower)
      const pressure = pressureForDeal(companyId, destination.sponsorId)
      next = {
        ...next,
        npcParties: next.npcParties.map((npc) =>
          npc.id === govNpc.id
            ? {
                ...npc,
                pokladna: npc.pokladna + cash,
                preferencie: round1(npc.preferencie + cash / 250_000),
              }
            : npc,
        ),
        kauzyPressure: round1(next.kauzyPressure + pressure * 0.5),
        fnmAssigned: { ...next.fnmAssigned, [companyId]: destination },
        fnmOffered: next.fnmOffered.filter((id) => id !== companyId),
      }
    } else if (destination.kind === 'cancel') {
      next = {
        ...next,
        fnmPool: [...next.fnmPool, companyId],
        fnmAssigned: { ...next.fnmAssigned, [companyId]: destination },
        fnmOffered: next.fnmOffered.filter((id) => id !== companyId),
      }
    } else {
      next = {
        ...next,
        fnmAssigned: { ...next.fnmAssigned, [companyId]: destination },
        fnmOffered: next.fnmOffered.filter((id) => id !== companyId),
      }
    }
  }

  return { ...next, fnmOffered: [], rngState: rng.state }
}

/** Opposition NPCs take a Peniaze beat after the player's Fond phase. */
export function runNpcOppositionPeniaze(state: GameState, rng: Rng): GameState {
  if (state.phase !== 'playing' || !state.inGovernment) {
    return state
  }
  let next = state
  for (let i = 0; i < next.npcParties.length; i += 1) {
    const npc = next.npcParties[i]
    if (npc.inGovernment) continue
    rng.next()
    const actionId = pickNpcPeniazeAction(npc.id)
    const effects = npcPeniazeActions[actionId]
    next = {
      ...next,
      npcParties: next.npcParties.map((row, idx) =>
        idx === i
          ? {
              ...row,
              preferencie: round1(row.preferencie + effects.preferencie),
              pokladna: row.pokladna + effects.pokladna,
            }
          : row,
      ),
    }
  }
  return { ...next, rngState: rng.state }
}
