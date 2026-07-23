import { motion, useReducedMotion } from 'framer-motion'
import { useGameStore } from './useGameStore'
import './HudStrip.css'

function formatSk(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 10_000) {
    return `${Math.round(amount / 1000)}k`
  }
  return `${Math.round(amount)}`
}

export function HudStrip() {
  const state = useGameStore((s) => s.state)
  const reduceMotion = useReducedMotion()
  const eyeLevel = Math.min(1, state.kauzyPressure / 12)

  return (
    <header className="hud" aria-label="Skóre">
      <div className="hud__cell hud__cell--hero">
        <span className="hud__label">Pref</span>
        <motion.strong
          key={state.preferencie.toFixed(1)}
          className="hud__value hud__value--hero"
          initial={reduceMotion ? false : { scale: 1.18, color: '#b8d4a8' }}
          animate={{ scale: 1, color: '#e8e2d6' }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          {state.preferencie.toFixed(1)}%
        </motion.strong>
      </div>
      <div className="hud__cell">
        <span className="hud__label">Pokladňa</span>
        <strong className="hud__value">{formatSk(state.pokladna)} Sk</strong>
      </div>
      {state.turnPhase === 'politika' ? (
        <div className="hud__cell">
          <span className="hud__label">AP</span>
          <strong className="hud__value hud__value--signal">{state.actionPoints}</strong>
        </div>
      ) : (
        <div className="hud__cell">
          <span className="hud__label">Koalícia</span>
          <strong className="hud__value">{state.koalicia.toFixed(0)}</strong>
        </div>
      )}
      <div
        className="hud__eye"
        style={{ ['--eye-level' as string]: String(eyeLevel) }}
        title={`Kauzy tlak ${state.kauzyPressure.toFixed(1)}`}
        aria-label={`Kauzy tlak ${state.kauzyPressure.toFixed(1)}`}
      >
        <span className="hud__eye-pupil" />
      </div>
    </header>
  )
}
