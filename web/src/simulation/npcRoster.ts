import {
  npcArchetypes,
  type NpcArchetypeId,
} from '../content/npcParties'
import type { GameState, PartyPresetId } from './types'

export type NpcPartyState = {
  id: NpcArchetypeId
  preferencie: number
  pokladna: number
  inGovernment: boolean
}

export type NpcRoster = {
  npcParties: NpcPartyState[]
  mainAntagonistId: NpcArchetypeId
}

function party(
  id: NpcArchetypeId,
  inGovernment: boolean,
  preferencie?: number,
): NpcPartyState {
  const arch = npcArchetypes[id]
  return {
    id,
    preferencie: preferencie ?? arch.startingPreferencie,
    pokladna: 40_000,
    inGovernment,
  }
}

/**
 * Three NPC seats. Hnutie is the gravity-well antagonist unless the player
 * took the Stroj moci (Hnutie-like) preset.
 */
export function buildNpcRoster(
  presetId: PartyPresetId | null,
  playerInGovernment: boolean,
): NpcRoster {
  if (presetId === 'hnutie-machine') {
    return {
      npcParties: [
        party('narodniari', true),
        party('lavica', false),
        party('robotnici', false),
      ],
      mainAntagonistId: 'lavica',
    }
  }

  if (playerInGovernment) {
    return {
      npcParties: [
        party('hnutie', false),
        party('narodniari', true),
        party('lavica', false),
      ],
      mainAntagonistId: 'hnutie',
    }
  }

  return {
    npcParties: [
      party('hnutie', true),
      party('narodniari', true),
      party('lavica', false),
    ],
    mainAntagonistId: 'hnutie',
  }
}

export function initialNpcFields(): Pick<GameState, 'npcParties' | 'mainAntagonistId'> {
  return {
    npcParties: [],
    mainAntagonistId: null,
  }
}
