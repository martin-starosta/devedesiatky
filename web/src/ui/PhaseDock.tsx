import type { TurnPhase } from '../simulation'
import './PhaseDock.css'

const steps: Array<{ id: TurnPhase; label: string }> = [
  { id: 'politika', label: 'Politika' },
  { id: 'peniaze', label: 'Fond' },
  { id: 'event', label: 'Udalosť' },
  { id: 'centrala', label: 'Centrála' },
]

export function PhaseDock({ phase }: { phase: TurnPhase }) {
  return (
    <nav className="dock" aria-label="Fáza ťahu">
      {steps.map((step) => (
        <div
          key={step.id}
          className={
            step.id === phase || (phase === 'fact' && step.id === 'event')
              ? 'dock__step dock__step--active'
              : 'dock__step'
          }
          aria-current={
            step.id === phase || (phase === 'fact' && step.id === 'event')
              ? 'step'
              : undefined
          }
        >
          {step.label}
        </div>
      ))}
    </nav>
  )
}
