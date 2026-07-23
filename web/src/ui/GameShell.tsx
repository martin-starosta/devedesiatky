import type { ReactNode } from 'react'
import type { TurnPhase } from '../simulation'
import { FloatLayer } from './FloatLayer'
import { HudStrip } from './HudStrip'
import { PhaseDock } from './PhaseDock'
import './GameShell.css'

export function GameShell({
  phase,
  children,
}: {
  phase: TurnPhase
  children: ReactNode
}) {
  return (
    <div className="shell" data-phase={phase}>
      <div className="shell__chrome">
        <HudStrip />
      </div>
      <div className="shell__stage">{children}</div>
      <div className="shell__chrome shell__chrome--bottom">
        <PhaseDock phase={phase} />
      </div>
      <FloatLayer />
    </div>
  )
}
