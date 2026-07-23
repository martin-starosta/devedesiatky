import { motion } from 'framer-motion'
import type { DemographicId } from '../simulation'
import { useGameStore } from './useGameStore'
import './Centrala.css'

function formatDateLabel(year: number, quarter: number): string {
  const names = ['1. štvrťrok', '2. štvrťrok', '3. štvrťrok', '4. štvrťrok'] as const
  return `${names[quarter - 1]} ${year}`
}

function formatSkCurrency(amount: number): string {
  return `${Math.round(amount).toLocaleString('sk-SK')} Sk`
}

const demographicLabelsSk: Record<DemographicId, string> = {
  narodovci: 'Národovci',
  mestania: 'Mešťania',
  robotnici: 'Robotníci',
  podnikatelia: 'Podnikatelia',
  zapadniari: 'Západniari',
  vychodniari: 'Východniari',
}

function topDemographics(
  weights: Record<DemographicId, number>,
  count: number,
): Array<{ id: DemographicId; weight: number }> {
  return (Object.entries(weights) as Array<[DemographicId, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([id, weight]) => ({ id, weight }))
}

export function Centrala() {
  const state = useGameStore((s) => s.state)
  const advanceQuarter = useGameStore((s) => s.advanceQuarter)
  const topWeights = topDemographics(state.demographicWeights, 3)
  const eyeLevel = Math.min(1, state.kauzyPressure / 12)

  return (
    <main className="centrala">
      <header className="centrala__brand">
        <p className="centrala__eyebrow">Centrála</p>
        <h1 className="centrala__title">Divoké deväťdesiate</h1>
      </header>

      <motion.section
        className="centrala__board"
        key={`${state.year}-${state.quarter}-${state.preferencie}-${state.pokladna}`}
        initial={{ opacity: 0.55, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="centrala__metric">
          <span className="centrala__label">Preferencie</span>
          <strong className="centrala__value centrala__value--hero">
            {state.preferencie.toFixed(1)}&nbsp;%
          </strong>
        </div>
        <div className="centrala__metrics-row">
          <div className="centrala__metric">
            <span className="centrala__label">Pokladňa</span>
            <strong className="centrala__value centrala__value--sm">
              {formatSkCurrency(state.pokladna)}
            </strong>
          </div>
          <div className="centrala__metric">
            <span className="centrala__label">Kancelárie</span>
            <strong className="centrala__value centrala__value--sm">{state.offices}</strong>
          </div>
        </div>
        <div className="centrala__metrics-row">
          <div className="centrala__metric">
            <span className="centrala__label">Reputácia</span>
            <strong className="centrala__value centrala__value--sm">
              {state.reputacia.toFixed(1)}
            </strong>
          </div>
          <div className="centrala__metric">
            <span className="centrala__label">Médiá</span>
            <strong className="centrala__value centrala__value--sm">
              {state.media.toFixed(1)}
            </strong>
          </div>
        </div>
        <div className="centrala__metric">
          <span className="centrala__label">Kauzy — oko</span>
          <div
            className="centrala__eye"
            style={{ ['--eye-level' as string]: String(eyeLevel) }}
            title={`${state.kauzy.length} zápisov · tlak ${state.kauzyPressure.toFixed(1)}`}
            aria-label={`Tlak kauz ${state.kauzyPressure.toFixed(1)}`}
          >
            <span className="centrala__eye-pupil" />
          </div>
          <span className="centrala__eye-meta">
            {state.kauzy.length} v ledgeri · tlak {state.kauzyPressure.toFixed(1)}
          </span>
        </div>
        <div className="centrala__metric">
          <span className="centrala__label">Voličská základňa</span>
          <ul className="centrala__weights">
            {topWeights.map((row) => (
              <li key={row.id}>
                <strong>{demographicLabelsSk[row.id]}</strong>
                {' — '}
                {Math.round(row.weight * 100)}&nbsp;%
              </li>
            ))}
          </ul>
        </div>
        <div className="centrala__metric">
          <span className="centrala__label">Dátum</span>
          <strong className="centrala__value">
            {formatDateLabel(state.year, state.quarter)}
          </strong>
        </div>
      </motion.section>

      <button type="button" className="centrala__cta" onClick={advanceQuarter}>
        Ďalší štvrťrok
      </button>
    </main>
  )
}
