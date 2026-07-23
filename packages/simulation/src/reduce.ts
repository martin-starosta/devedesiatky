import type { GameAction, GameState, Quarter, Rng } from './types'
import { applyFoundParty } from './foundParty'
import {
  applyAssignFnm,
  applyAssignToSponsor,
  applyFinishPeniaze,
} from './patronage'
import {
  applyFinishPolitika,
  applySpendPolitika,
  openPolitikaPhase,
} from './politika'
import {
  applyCollectFact,
  applyDismissFact,
  applyResolveEvent,
  applyTryOpenEvent,
} from './events'
import {
  applyAssignInstitution,
  applyCampaignSpend,
  applyContinueAfterNight,
  applyFinishCampaign,
  applyFinishCoalition,
  applyFinishNocNozov,
  applyOfferCoalition,
  applyResolveElectionNight,
  applySkipNocNozov,
} from './volby94'

function nextQuarter(year: number, quarter: Quarter): { year: number; quarter: Quarter } {
  if (quarter === 4) {
    return { year: year + 1, quarter: 1 }
  }
  return { year, quarter: (quarter + 1) as Quarter }
}

/**
 * Pure quarterly simulation reducer. UI must never own rules — dispatch actions here.
 * Signature: (state, action, rng) → state
 */
export function reduce(state: GameState, action: GameAction, rng: Rng): GameState {
  switch (action.type) {
    case 'FOUND_PARTY':
      return applyFoundParty(state, action, rng)
    case 'SPEND_POLITIKA':
      return applySpendPolitika(state, action, rng)
    case 'FINISH_POLITIKA':
      return applyFinishPolitika(state, rng)
    case 'ASSIGN_FNM':
      return applyAssignFnm(state, action, rng)
    case 'ASSIGN_TO_SPONSOR':
      return applyAssignToSponsor(state, action, rng)
    case 'FINISH_PENIAZE':
      return applyFinishPeniaze(state, rng)
    case 'TRY_OPEN_EVENT':
      return applyTryOpenEvent(state)
    case 'RESOLVE_EVENT':
      return applyResolveEvent(state, action, rng)
    case 'COLLECT_FACT':
      return applyCollectFact(state)
    case 'DISMISS_FACT':
      return applyDismissFact(state)
    case 'CAMPAIGN_SPEND':
      return applyCampaignSpend(state, action, rng)
    case 'FINISH_CAMPAIGN':
      return applyFinishCampaign(state, rng)
    case 'RESOLVE_ELECTION_NIGHT':
      return applyResolveElectionNight(state, rng)
    case 'CONTINUE_AFTER_NIGHT':
      return applyContinueAfterNight(state, rng)
    case 'OFFER_COALITION':
      return applyOfferCoalition(state, action, rng)
    case 'FINISH_COALITION':
      return applyFinishCoalition(state, rng)
    case 'SKIP_NOC_NOZOV':
      return applySkipNocNozov(state, rng)
    case 'ASSIGN_INSTITUTION':
      return applyAssignInstitution(state, action)
    case 'FINISH_NOC_NOZOV':
      return applyFinishNocNozov(state, rng)
    case 'ADVANCE_QUARTER': {
      if (state.phase !== 'playing' || state.turnPhase !== 'centrala') {
        return state
      }
      rng.next()
      const calendar = nextQuarter(state.year, state.quarter)
      const advanced: GameState = {
        ...state,
        ...calendar,
        rngState: rng.state,
      }
      return openPolitikaPhase(advanced, rng)
    }
  }
}
