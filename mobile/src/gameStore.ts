import { create, type StoreApi, type UseBoundStore } from 'zustand'
import {
  choicesForEvent,
  createBootstrapState,
  createRng,
  reduce,
  type CompanyId,
  type EventChoiceId,
  type FnmDestination,
  type GameState,
  type Ideology,
  type NpcArchetypeId,
  type PartyPresetId,
  type PolitikaActionId,
} from '@devedesiatky/simulation'
import type {
  CampaignChannel,
  CampaignRegion,
  CoalitionPost,
  InstitutionAssignee,
  InstitutionId,
} from '@devedesiatky/content'
import type { Persistence } from './persistence'

type NewGameResult = { needsConfirmation: true } | { needsConfirmation: false }

type GameStore = {
  state: GameState
  hasSave: boolean
  hydrated: boolean
  hydrate: () => Promise<void>
  foundParty: (input: { ideology?: Ideology; preset?: PartyPresetId }) => Promise<void>
  advanceQuarter: () => Promise<void>
  spendPolitika: (actionId: PolitikaActionId) => Promise<void>
  finishPolitika: () => Promise<void>
  assignFnm: (companyId: CompanyId, destination: FnmDestination) => Promise<void>
  finishPeniaze: () => Promise<void>
  resolveEvent: (choiceId?: EventChoiceId) => Promise<void>
  collectFact: () => Promise<void>
  dismissFact: () => Promise<void>
  campaignSpend: (input: {
    region: CampaignRegion
    channel: CampaignChannel
    amount: number
  }) => Promise<void>
  finishCampaign: () => Promise<void>
  resolveElectionNight: () => Promise<void>
  continueAfterNight: () => Promise<void>
  offerCoalition: (input: { partnerId: NpcArchetypeId; posts: CoalitionPost[] }) => Promise<void>
  finishCoalition: () => Promise<void>
  skipNocNozov: () => Promise<void>
  assignInstitution: (input: {
    institutionId: InstitutionId
    assigneeId: InstitutionAssignee
  }) => Promise<void>
  finishNocNozov: () => Promise<void>
  newGame: (input: { confirmed: boolean }) => NewGameResult | Promise<NewGameResult>
}

export type GameStoreApi = UseBoundStore<StoreApi<GameStore>>

const DURABLE_ACTIONS = new Set([
  'FOUND_PARTY',
  'SPEND_POLITIKA',
  'FINISH_POLITIKA',
  'ASSIGN_FNM',
  'FINISH_PENIAZE',
  'RESOLVE_EVENT',
  'DISMISS_FACT',
  'COLLECT_FACT',
  'ADVANCE_QUARTER',
  'CAMPAIGN_SPEND',
  'FINISH_CAMPAIGN',
  'RESOLVE_ELECTION_NIGHT',
  'CONTINUE_AFTER_NIGHT',
  'OFFER_COALITION',
  'FINISH_COALITION',
  'SKIP_NOC_NOZOV',
  'ASSIGN_INSTITUTION',
  'FINISH_NOC_NOZOV',
])

export function createGameStore(options: { persistence: Persistence; seed?: number }): GameStoreApi {
  const { persistence, seed = 1993 } = options

  return create<GameStore>((set, get) => {
    async function dispatch(action: Parameters<typeof reduce>[1]) {
      const current = get().state
      const next = reduce(current, action, createRng(current.rngState))
      set({ state: next })
      if (DURABLE_ACTIONS.has(action.type)) {
        await persistence.save(next)
        set({ hasSave: true })
      }
    }

    return {
      state: createBootstrapState({ seed }),
      hasSave: false,
      hydrated: false,
      hydrate: async () => {
        const saved = await persistence.load()
        if (saved) {
          set({ state: saved, hasSave: true, hydrated: true })
          return
        }
        set({ hasSave: false, hydrated: true })
      },
      foundParty: async (input) => {
        await dispatch({
          type: 'FOUND_PARTY',
          ideology: input.ideology,
          preset: input.preset,
        })
      },
      advanceQuarter: async () => {
        await dispatch({ type: 'ADVANCE_QUARTER' })
      },
      spendPolitika: async (actionId) => {
        await dispatch({ type: 'SPEND_POLITIKA', actionId })
      },
      finishPolitika: async () => {
        await dispatch({ type: 'FINISH_POLITIKA' })
      },
      assignFnm: async (companyId, destination) => {
        await dispatch({ type: 'ASSIGN_FNM', companyId, destination })
      },
      finishPeniaze: async () => {
        await dispatch({ type: 'FINISH_PENIAZE' })
      },
      resolveEvent: async (choiceId) => {
        const { state } = get()
        if (state.turnPhase !== 'event' || !state.activeEventId) return
        const choice = choiceId ?? choicesForEvent(state)[0]?.id
        if (!choice) return
        await dispatch({ type: 'RESOLVE_EVENT', choiceId: choice })
      },
      collectFact: async () => {
        await dispatch({ type: 'COLLECT_FACT' })
      },
      dismissFact: async () => {
        await dispatch({ type: 'DISMISS_FACT' })
      },
      campaignSpend: async (input) => {
        await dispatch({ type: 'CAMPAIGN_SPEND', ...input })
      },
      finishCampaign: async () => {
        await dispatch({ type: 'FINISH_CAMPAIGN' })
      },
      resolveElectionNight: async () => {
        await dispatch({ type: 'RESOLVE_ELECTION_NIGHT' })
      },
      continueAfterNight: async () => {
        await dispatch({ type: 'CONTINUE_AFTER_NIGHT' })
      },
      offerCoalition: async (input) => {
        await dispatch({ type: 'OFFER_COALITION', ...input })
      },
      finishCoalition: async () => {
        await dispatch({ type: 'FINISH_COALITION' })
      },
      skipNocNozov: async () => {
        await dispatch({ type: 'SKIP_NOC_NOZOV' })
      },
      assignInstitution: async (input) => {
        await dispatch({ type: 'ASSIGN_INSTITUTION', ...input })
      },
      finishNocNozov: async () => {
        await dispatch({ type: 'FINISH_NOC_NOZOV' })
      },
      newGame: (input) => {
        if (get().hasSave && !input.confirmed) {
          return { needsConfirmation: true }
        }
        return (async () => {
          await persistence.clear()
          set({
            state: createBootstrapState({ seed }),
            hasSave: false,
          })
          return { needsConfirmation: false }
        })()
      },
    }
  })
}
