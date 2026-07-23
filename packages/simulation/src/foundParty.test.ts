import { describe, expect, it } from 'vitest'
import { createBootstrapState } from './createBootstrapState'
import { createRng } from './rng'
import { reduce } from './reduce'

describe('FOUND_PARTY', () => {
  it('initializes resources from ideology sliders for a fixed seed', () => {
    const boot = createBootstrapState({ seed: 42 })
    expect(boot.phase).toBe('setup')

    const next = reduce(
      boot,
      {
        type: 'FOUND_PARTY',
        ideology: {
          narodnyObciansky: 0.4,
          socialnyTrhovy: -0.2,
          vychodZapad: 0.6,
        },
      },
      createRng(boot.rngState),
    )

    expect(next.phase).toBe('playing')
    expect(next.ideology).toEqual({
      narodnyObciansky: 0.4,
      socialnyTrhovy: -0.2,
      vychodZapad: 0.6,
    })
    expect(next.pokladna).toBe(40_000)
    expect(next.offices).toBe(3)
    expect(next.preferencie).toBe(10.2)
    expect(next.demographicWeights.mestania).toBeGreaterThan(
      next.demographicWeights.narodovci,
    )
    expect(next.demographicWeights.zapadniari).toBeGreaterThan(
      next.demographicWeights.vychodniari,
    )

    const again = reduce(
      boot,
      {
        type: 'FOUND_PARTY',
        ideology: {
          narodnyObciansky: 0.4,
          socialnyTrhovy: -0.2,
          vychodZapad: 0.6,
        },
      },
      createRng(boot.rngState),
    )
    expect(again).toEqual(next)
  })

  it('Hnutie machine and challenger presets produce different starts', () => {
    const boot = createBootstrapState({ seed: 99 })

    const machine = reduce(
      boot,
      { type: 'FOUND_PARTY', preset: 'hnutie-machine' },
      createRng(boot.rngState),
    )
    const challenger = reduce(
      boot,
      { type: 'FOUND_PARTY', preset: 'challenger' },
      createRng(boot.rngState),
    )

    expect(machine.preferencie).toBeGreaterThan(challenger.preferencie)
    expect(machine.offices).toBeGreaterThan(challenger.offices)
    expect(machine.pokladna).toBeGreaterThan(challenger.pokladna)
    expect(machine.ideology.narodnyObciansky).toBeLessThan(
      challenger.ideology.narodnyObciansky,
    )
    expect(machine.demographicWeights).not.toEqual(challenger.demographicWeights)
  })
})
