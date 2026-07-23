import { motion } from 'framer-motion'
import { useGameStore } from './useGameStore'
import './Centrala.css'

function formatDateLabel(year: number, quarter: number): string {
  const names = ['1. štvrťrok', '2. štvrťrok', '3. štvrťrok', '4. štvrťrok'] as const
  return `${names[quarter - 1]} ${year}`
}

export function Centrala() {
  const state = useGameStore((s) => s.state)
  const advanceQuarter = useGameStore((s) => s.advanceQuarter)

  return (
    <main className="centrala">
      <header className="centrala__brand">
        <p className="centrala__eyebrow">Centrála</p>
        <h1 className="centrala__title">Divoké deväťdesiate</h1>
      </header>

      <motion.section
        className="centrala__board"
        key={`${state.year}-${state.quarter}`}
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
