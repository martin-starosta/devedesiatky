import { describe, expect, it } from 'vitest'
import {
  formatDateLabel,
  formatSk,
  isVolbyPhase,
  koaliciaHint,
  phaseDockSteps,
  phaseDockActiveId,
} from './shellModel'
import type { TurnPhase } from '@devedesiatky/simulation'

describe('shellModel', () => {
  it('formats pokladňa compactly', () => {
    expect(formatSk(900)).toBe('900')
    expect(formatSk(25_000)).toBe('25k')
    expect(formatSk(1_500_000)).toBe('1.5M')
  })

  it('maps turnPhase to dock active step', () => {
    expect(phaseDockActiveId('politika')).toBe('politika')
    expect(phaseDockActiveId('fact')).toBe('event')
    expect(phaseDockActiveId('volby-noc')).toBe('volby-kampan')
    expect(phaseDockActiveId('centrala')).toBe('centrala')
  })

  it('exposes dock steps and volby helper', () => {
    expect(phaseDockSteps.map((s) => s.id)).toEqual([
      'politika',
      'peniaze',
      'event',
      'volby-kampan',
      'centrala',
    ])
    expect(isVolbyPhase('volby-koalicia')).toBe(true)
    expect(isVolbyPhase('politika')).toBe(false)
  })

  it('formats date and koalícia hint in Slovak', () => {
    expect(formatDateLabel(1993, 1)).toBe('1. štvrťrok 1993')
    expect(koaliciaHint(80, true)).toBe('ok')
    expect(koaliciaHint(50, true)).toBe('krehká')
    expect(koaliciaHint(10, true)).toBe('riziko')
    expect(koaliciaHint(90, false)).toBe('mimo')
  })

  it('covers every TurnPhase with a dock step', () => {
    const phases: TurnPhase[] = [
      'politika',
      'peniaze',
      'event',
      'fact',
      'centrala',
      'volby-kampan',
      'volby-noc',
      'volby-koalicia',
      'volby-noc-nozo',
    ]
    for (const phase of phases) {
      expect(phaseDockSteps.some((s) => s.id === phaseDockActiveId(phase))).toBe(true)
    }
  })
})
