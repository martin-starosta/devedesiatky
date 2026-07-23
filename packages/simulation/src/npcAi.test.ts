import { describe, expect, it } from 'vitest'
import { npcArchetypes } from '@devedesiatky/content'
import { createInitialState } from './createInitialState'
import { createRng } from './rng'
import { pickNpcPeniazeAction, pickNpcPeniazeDestination, pickNpcPolitikaAction } from './npcAi'
import { reduce } from './reduce'
import { seatsFromField, snemField } from './snem'

describe('NPC utility AI', () => {
  it('two archetypes pick different Politika actions under the same seed/state', () => {
    const state = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'challenger',
      openPolitika: true,
    })
    expect(state.seed).toBe(42)
    expect(state.inGovernment).toBe(false)

    const hnutie = pickNpcPolitikaAction({
      archetypeId: 'hnutie',
      inGovernment: true,
    })
    const lavica = pickNpcPolitikaAction({
      archetypeId: 'lavica',
      inGovernment: true,
    })

    expect(hnutie).not.toBe(lavica)
    expect(npcArchetypes.hnutie.weights).not.toEqual(npcArchetypes.lavica.weights)
  })

  it('spawns three NPCs with Hnutie as antagonist unless player took Stroj moci', () => {
    const defaultRun = createInitialState({
      seed: 7,
      preferencie: 10,
      openPolitika: true,
    })
    expect(defaultRun.npcParties).toHaveLength(3)
    expect(defaultRun.mainAntagonistId).toBe('hnutie')
    expect(defaultRun.npcParties.map((p) => p.id)).toContain('hnutie')

    const machine = createInitialState({
      seed: 7,
      preferencie: 12,
      preset: 'hnutie-machine',
      openPolitika: true,
    })
    expect(machine.npcParties).toHaveLength(3)
    expect(machine.npcParties.map((p) => p.id)).not.toContain('hnutie')
    expect(machine.mainAntagonistId).not.toBe('hnutie')
    expect(machine.mainAntagonistId).toBeTruthy()
  })

  it('runs NPC Politika picks through the reducer on FINISH_POLITIKA', () => {
    let state = createInitialState({
      seed: 42,
      preferencie: 10,
      preset: 'hnutie-machine',
      openPolitika: true,
    })
    const before = state.npcParties.map((p) => ({ id: p.id, preferencie: p.preferencie }))

    state = reduce(state, { type: 'FINISH_POLITIKA' }, createRng(state.rngState))

    const after = state.npcParties
    expect(after.some((npc, i) => npc.preferencie !== before[i].preferencie)).toBe(true)
  })

  it('NPC government assigns FNM via utility when player is opposition', () => {
    let state = createInitialState({
      seed: 99,
      preferencie: 10,
      preset: 'challenger',
      openPolitika: true,
    })
    expect(state.inGovernment).toBe(false)
    expect(state.npcParties.some((p) => p.inGovernment)).toBe(true)

    state = reduce(state, { type: 'FINISH_POLITIKA' }, createRng(state.rngState))

    expect(Object.keys(state.fnmAssigned).length).toBeGreaterThan(0)
    expect(state.turnPhase === 'event' || state.turnPhase === 'centrala' || state.turnPhase === 'fact').toBe(
      true,
    )
  })

  it('patronage-hungry archetype prefers sponsor cash over cancel', () => {
    const pick = pickNpcPeniazeDestination({
      archetypeId: 'hnutie',
      companyId: 'oceliare-vychod',
      patronagePower: 'full',
    })
    expect(pick.kind).toBe('sponsor')
  })

  it('two archetypes pick different opposition Peniaze actions', () => {
    expect(pickNpcPeniazeAction('hnutie')).not.toBe(pickNpcPeniazeAction('lavica'))
  })
})

describe('Snem field', () => {
  it('maps player + NPC preferencie to seat arcs with majority readout', () => {
    const state = createInitialState({
      seed: 3,
      preferencie: 12,
      preset: 'hnutie-machine',
    })
    const field = snemField(state)
    expect(field.totalSeats).toBe(150)
    expect(field.majority).toBe(76)
    expect(field.arcs).toHaveLength(1 + state.npcParties.length)
    expect(field.arcs.reduce((sum, arc) => sum + arc.seats, 0)).toBe(150)
    expect(field.coalitionSeats).toBe(
      field.arcs.filter((a) => a.inGovernment).reduce((s, a) => s + a.seats, 0),
    )
    expect(seatsFromField(field).length).toBe(field.arcs.length)
  })
})
