import type { TurnPhase } from '@devedesiatky/simulation'

export function formatSk(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 10_000) {
    return `${Math.round(amount / 1000)}k`
  }
  return `${Math.round(amount)}`
}

export function formatDateLabel(year: number, quarter: number): string {
  const names = ['1. štvrťrok', '2. štvrťrok', '3. štvrťrok', '4. štvrťrok'] as const
  return `${names[quarter - 1]} ${year}`
}

export function koaliciaHint(koalicia: number, inGovernment: boolean): string {
  if (!inGovernment) return 'mimo'
  if (koalicia >= 70) return 'ok'
  if (koalicia >= 40) return 'krehká'
  return 'riziko'
}

export const phaseDockSteps: Array<{ id: TurnPhase; label: string }> = [
  { id: 'politika', label: 'Politika' },
  { id: 'peniaze', label: 'Fond' },
  { id: 'event', label: 'Udalosť' },
  { id: 'volby-kampan', label: 'Voľby' },
  { id: 'centrala', label: 'Centrála' },
]

export function isVolbyPhase(phase: TurnPhase): boolean {
  return (
    phase === 'volby-kampan' ||
    phase === 'volby-noc' ||
    phase === 'volby-koalicia' ||
    phase === 'volby-noc-nozo'
  )
}

export function phaseDockActiveId(phase: TurnPhase): TurnPhase {
  if (phase === 'fact') return 'event'
  if (isVolbyPhase(phase)) return 'volby-kampan'
  return phase
}
