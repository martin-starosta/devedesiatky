import type { TurnPhase } from '@devedesiatky/simulation'
import './PhaseDock.css'

const steps: Array<{ id: TurnPhase; label: string }> = [
  { id: 'politika', label: 'Politika' },
  { id: 'peniaze', label: 'Fond' },
  { id: 'event', label: 'Udalosť' },
  { id: 'volby-kampan', label: 'Voľby' },
  { id: 'centrala', label: 'Centrála' },
]

function isVolbyPhase(phase: TurnPhase): boolean {
  return (
    phase === 'volby-kampan' ||
    phase === 'volby-noc' ||
    phase === 'volby-koalicia' ||
    phase === 'volby-noc-nozo'
  )
}

export function PhaseDock({ phase }: { phase: TurnPhase }) {
  return (
    <nav className="dock" aria-label="Fáza ťahu">
      {steps.map((step) => {
        const active =
          step.id === phase ||
          (phase === 'fact' && step.id === 'event') ||
          (step.id === 'volby-kampan' && isVolbyPhase(phase))
        return (
          <div
            key={step.id}
            className={active ? 'dock__step dock__step--active' : 'dock__step'}
            aria-current={active ? 'step' : undefined}
          >
            {step.label}
          </div>
        )
      })}
    </nav>
  )
}
