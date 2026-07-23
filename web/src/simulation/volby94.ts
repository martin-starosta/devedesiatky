import type { FactId } from '../content/timeline'
import {
  campaignChannels,
  coalitionAcceptThreshold,
  coalitionPosts,
  institutions,
  volby94CampaignRounds,
  volby94FactId,
  type CampaignChannel,
  type CampaignRegion,
  type CoalitionPost,
  type InstitutionId,
} from '../content/volby94'
import { onLostPower } from './kauzy'
import { MAJORITY_SEATS, allocateSeats } from './snem'
import type { ElectionState, GameAction, GameState, Rng } from './types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function emptyInstitutions(): ElectionState['institutions'] {
  return {
    sis: null,
    stv: null,
    fnm: null,
    policia: null,
    justicia: null,
  }
}

export function createEmptyElection(): ElectionState {
  return {
    id: 'volby-94',
    stage: 'campaign',
    campaignRound: 1,
    maxRounds: volby94CampaignRounds,
    boostByRegion: { zapad: 0, stred: 0, vychod: 0 },
    totalBoost: 0,
    exitPoll: null,
    finalShare: null,
    won: null,
    coalitionPartnerId: null,
    offeredPosts: [],
    acceptedPosts: [],
    institutions: emptyInstitutions(),
  }
}

export function initialElectionFields(): Pick<GameState, 'election'> {
  return { election: null }
}

export function startVolby94(state: GameState): GameState {
  if (state.resolvedEventIds.includes('volby-94')) {
    return {
      ...state,
      turnPhase: 'centrala',
      activeEventId: null,
    }
  }
  return {
    ...state,
    turnPhase: 'volby-kampan',
    activeEventId: null,
    pendingFactId: null,
    election: createEmptyElection(),
  }
}

function spendCost(
  amount: number,
  channel: CampaignChannel,
  media: number,
): { cost: number; reputacia: number; boost: number } {
  const def = campaignChannels[channel]
  let cost = amount
  if (def.mediaDiscount && media >= 6) {
    cost = Math.round(amount * 0.7)
  }
  const boost = (amount / 10_000) * def.efficiency
  return {
    cost,
    reputacia: def.reputacia ?? 0,
    boost: round1(boost),
  }
}

export function applyCampaignSpend(
  state: GameState,
  action: Extract<GameAction, { type: 'CAMPAIGN_SPEND' }>,
  rng: Rng,
): GameState {
  if (
    state.phase !== 'playing' ||
    state.turnPhase !== 'volby-kampan' ||
    !state.election ||
    state.election.stage !== 'campaign'
  ) {
    return state
  }
  if (action.amount <= 0 || state.pokladna < action.amount) {
    return state
  }
  if (!(action.region in state.election.boostByRegion)) {
    return state
  }
  if (!(action.channel in campaignChannels)) {
    return state
  }

  rng.next()
  const { cost, reputacia, boost } = spendCost(action.amount, action.channel, state.media)
  if (state.pokladna < cost) {
    return state
  }

  const region = action.region as CampaignRegion
  const boostByRegion = {
    ...state.election.boostByRegion,
    [region]: round1(state.election.boostByRegion[region] + boost),
  }
  const totalBoost = round1(state.election.totalBoost + boost)

  return {
    ...state,
    pokladna: state.pokladna - cost,
    reputacia: round1(state.reputacia + reputacia),
    election: {
      ...state.election,
      boostByRegion,
      totalBoost,
    },
    rngState: rng.state,
  }
}

export function applyFinishCampaign(state: GameState, rng: Rng): GameState {
  if (
    state.phase !== 'playing' ||
    state.turnPhase !== 'volby-kampan' ||
    !state.election ||
    state.election.stage !== 'campaign'
  ) {
    return state
  }

  rng.next()
  const round = state.election.campaignRound
  if (round < state.election.maxRounds) {
    return {
      ...state,
      election: {
        ...state.election,
        campaignRound: (round + 1) as 1 | 2 | 3,
      },
      rngState: rng.state,
    }
  }

  return {
    ...state,
    turnPhase: 'volby-noc',
    election: {
      ...state.election,
      stage: 'night',
    },
    rngState: rng.state,
  }
}

function projectedShare(state: GameState, rng: Rng): { exitPoll: number; finalShare: number } {
  const base = state.preferencie + (state.election?.totalBoost ?? 0)
  const exitJitter = (rng.next() - 0.5) * 1.2
  const finalJitter = (rng.next() - 0.5) * 1.6
  return {
    exitPoll: round1(Math.max(3, base + exitJitter)),
    finalShare: round1(Math.max(3, base + finalJitter)),
  }
}

function seatsForShares(playerShare: number, npcShares: number[]): number[] {
  return allocateSeats([playerShare, ...npcShares], 150)
}

export function applyResolveElectionNight(state: GameState, rng: Rng): GameState {
  if (
    state.phase !== 'playing' ||
    state.turnPhase !== 'volby-noc' ||
    !state.election ||
    state.election.stage !== 'night'
  ) {
    return state
  }

  const { exitPoll, finalShare } = projectedShare(state, rng)
  const npcShares = state.npcParties.map((n) => n.preferencie)
  const seats = seatsForShares(finalShare, npcShares)
  const playerSeats = seats[0]

  // Win if player alone has majority, or player is largest and can court a partner to majority.
  const sortedNpc = [...state.npcParties]
    .map((npc, i) => ({ npc, seats: seats[i + 1] }))
    .sort((a, b) => b.seats - a.seats)
  const cheapestPartnerSeats = sortedNpc[0]?.seats ?? 0
  const canMajorityAlone = playerSeats >= MAJORITY_SEATS
  const canMajorityWithPartner = playerSeats + cheapestPartnerSeats >= MAJORITY_SEATS
  const isLargest = playerSeats >= Math.max(...seats.slice(1), 0)
  const won = canMajorityAlone || (isLargest && canMajorityWithPartner)

  let next: GameState = {
    ...state,
    preferencie: finalShare,
    election: {
      ...state.election,
      exitPoll,
      finalShare,
      won,
    },
    rngState: rng.state,
  }

  // Stay on night so the UI can show exit poll vs count before continuing.
  return next
}

export function applyContinueAfterNight(state: GameState, rng: Rng): GameState {
  if (
    state.phase !== 'playing' ||
    state.turnPhase !== 'volby-noc' ||
    !state.election ||
    state.election.stage !== 'night' ||
    state.election.won == null
  ) {
    return state
  }

  rng.next()
  const won = state.election.won
  let next: GameState = { ...state, rngState: rng.state }

  if (!won) {
    next = {
      ...next,
      inGovernment: false,
      koalicia: 0,
      npcParties: next.npcParties.map((npc) => ({
        ...npc,
        inGovernment: npc.id === next.mainAntagonistId,
      })),
      turnPhase: 'centrala',
      election: null,
      resolvedEventIds: next.resolvedEventIds.includes('volby-94')
        ? next.resolvedEventIds
        : [...next.resolvedEventIds, 'volby-94'],
    }
    return onLostPower(next)
  }

  return {
    ...next,
    turnPhase: 'volby-koalicia',
    election: {
      ...next.election!,
      stage: 'coalition',
    },
    inGovernment: true,
  }
}

function offerValue(posts: CoalitionPost[]): number {
  return posts.reduce((sum, post) => sum + (coalitionPosts[post]?.value ?? 0), 0)
}

export function applyOfferCoalition(
  state: GameState,
  action: Extract<GameAction, { type: 'OFFER_COALITION' }>,
  rng: Rng,
): GameState {
  if (
    state.phase !== 'playing' ||
    state.turnPhase !== 'volby-koalicia' ||
    !state.election ||
    state.election.stage !== 'coalition'
  ) {
    return state
  }

  const partner = state.npcParties.find((n) => n.id === action.partnerId)
  if (!partner) {
    return state
  }

  rng.next()
  const posts = action.posts.filter((p) => p in coalitionPosts) as CoalitionPost[]
  const value = offerValue(posts)
  const accepted = value >= coalitionAcceptThreshold

  if (!accepted) {
    return {
      ...state,
      election: {
        ...state.election,
        offeredPosts: posts,
        acceptedPosts: [],
        coalitionPartnerId: null,
      },
      rngState: rng.state,
    }
  }

  const koaliciaBump = posts.includes('interior') ? 28 : 14
  return {
    ...state,
    koalicia: round1(Math.min(100, Math.max(state.koalicia, 40) + koaliciaBump)),
    election: {
      ...state.election,
      offeredPosts: posts,
      acceptedPosts: posts,
      coalitionPartnerId: partner.id,
    },
    npcParties: state.npcParties.map((npc) => ({
      ...npc,
      inGovernment: npc.id === partner.id,
    })),
    rngState: rng.state,
  }
}

export function applyFinishCoalition(state: GameState, rng: Rng): GameState {
  if (
    state.phase !== 'playing' ||
    state.turnPhase !== 'volby-koalicia' ||
    !state.election ||
    state.election.stage !== 'coalition' ||
    !state.election.coalitionPartnerId
  ) {
    return state
  }

  rng.next()
  return {
    ...state,
    turnPhase: 'volby-noc-nozo',
    inGovernment: true,
    election: {
      ...state.election,
      stage: 'noc',
      institutions: emptyInstitutions(),
    },
    rngState: rng.state,
  }
}

/** Skip Noc and close the election with the fact card. */
export function applySkipNocNozov(state: GameState, rng: Rng): GameState {
  if (
    state.phase !== 'playing' ||
    state.turnPhase !== 'volby-koalicia' ||
    !state.election ||
    state.election.stage !== 'coalition' ||
    !state.election.coalitionPartnerId
  ) {
    return state
  }
  return closeElectionWithFact(state, rng)
}

function closeElectionWithFact(state: GameState, rng: Rng): GameState {
  rng.next()
  const hasInterior = state.election?.acceptedPosts.includes('interior') ?? false
  return {
    ...state,
    media: hasInterior ? round1(state.media + 1.5) : state.media,
    resolvedEventIds: state.resolvedEventIds.includes('volby-94')
      ? state.resolvedEventIds
      : [...state.resolvedEventIds, 'volby-94'],
    election: null,
    pendingFactId: volby94FactId as FactId,
    turnPhase: 'fact',
    inGovernment: true,
    rngState: rng.state,
  }
}

export function applyAssignInstitution(
  state: GameState,
  action: Extract<GameAction, { type: 'ASSIGN_INSTITUTION' }>,
): GameState {
  if (
    state.phase !== 'playing' ||
    state.turnPhase !== 'volby-noc-nozo' ||
    !state.election ||
    state.election.stage !== 'noc'
  ) {
    return state
  }
  if (!(action.institutionId in institutions)) {
    return state
  }
  const partnerId = state.election.coalitionPartnerId
  const okAssignee =
    action.assigneeId === 'player' ||
    action.assigneeId === partnerId ||
    state.npcParties.some((n) => n.id === action.assigneeId)
  if (!okAssignee) {
    return state
  }

  return {
    ...state,
    election: {
      ...state.election,
      institutions: {
        ...state.election.institutions,
        [action.institutionId as InstitutionId]: action.assigneeId,
      },
    },
  }
}

export function applyFinishNocNozov(state: GameState, rng: Rng): GameState {
  if (
    state.phase !== 'playing' ||
    state.turnPhase !== 'volby-noc-nozo' ||
    !state.election ||
    state.election.stage !== 'noc'
  ) {
    return state
  }

  return closeElectionWithFact(state, rng)
}
