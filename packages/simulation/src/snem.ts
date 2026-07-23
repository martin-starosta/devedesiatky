import { npcArchetypes } from '@devedesiatky/content'
import type { GameState } from './types'
import type { NpcArchetypeId } from '@devedesiatky/content'

export const SNEM_SEATS = 150
export const MAJORITY_SEATS = 76

export type SnemArc = {
  id: 'player' | NpcArchetypeId
  labelSk: string
  color: string
  preferencie: number
  seats: number
  inGovernment: boolean
  isAntagonist: boolean
}

export type SnemField = {
  totalSeats: number
  majority: number
  coalitionSeats: number
  holdsMajority: boolean
  arcs: SnemArc[]
}

/** Sainte-Laguë-ish: allocate integer seats from preferencie shares. */
export function allocateSeats(shares: number[], total: number): number[] {
  if (shares.length === 0) return []
  const sum = shares.reduce((a, b) => a + b, 0)
  if (sum <= 0) {
    const even = Math.floor(total / shares.length)
    const seats = shares.map(() => even)
    seats[0] += total - even * shares.length
    return seats
  }
  const raw = shares.map((s) => (s / sum) * total)
  const seats = raw.map((r) => Math.floor(r))
  let left = total - seats.reduce((a, b) => a + b, 0)
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
  for (let n = 0; n < left; n += 1) {
    seats[order[n % order.length].i] += 1
  }
  return seats
}

export function snemField(state: GameState): SnemField {
  const rows: Array<Omit<SnemArc, 'seats'>> = [
    {
      id: 'player',
      labelSk: 'Tvoja strana',
      color: '#e8e2d6',
      preferencie: state.preferencie,
      inGovernment: state.inGovernment,
      isAntagonist: false,
    },
    ...state.npcParties.map((npc) => ({
      id: npc.id as SnemArc['id'],
      labelSk: npcArchetypes[npc.id].labelSk,
      color: npcArchetypes[npc.id].color,
      preferencie: npc.preferencie,
      inGovernment: npc.inGovernment,
      isAntagonist: npc.id === state.mainAntagonistId,
    })),
  ]
  const seats = allocateSeats(
    rows.map((r) => Math.max(0, r.preferencie)),
    SNEM_SEATS,
  )
  const arcs: SnemArc[] = rows.map((row, i) => ({ ...row, seats: seats[i] }))
  const coalitionSeats = arcs
    .filter((a) => a.inGovernment)
    .reduce((sum, a) => sum + a.seats, 0)
  return {
    totalSeats: SNEM_SEATS,
    majority: MAJORITY_SEATS,
    coalitionSeats,
    holdsMajority: coalitionSeats >= MAJORITY_SEATS,
    arcs,
  }
}

export function seatsFromField(field: SnemField): number[] {
  return field.arcs.map((a) => a.seats)
}
