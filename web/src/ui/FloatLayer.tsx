import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { useGameStore } from './useGameStore'
import './FloatLayer.css'

type Floater = {
  id: string
  text: string
  kind: 'mint' | 'blood' | 'signal'
}

function formatPrefDelta(delta: number): string {
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}%`
}

function formatSkDelta(delta: number): string {
  const sign = delta > 0 ? '+' : ''
  if (Math.abs(delta) >= 1000) {
    return `${sign}${Math.round(delta / 1000)}k Sk`
  }
  return `${sign}${Math.round(delta)} Sk`
}

export function FloatLayer() {
  const preferencie = useGameStore((s) => s.state.preferencie)
  const pokladna = useGameStore((s) => s.state.pokladna)
  const kauzyPressure = useGameStore((s) => s.state.kauzyPressure)
  const reduceMotion = useReducedMotion()
  const uid = useId()
  const prev = useRef({ preferencie, pokladna, kauzyPressure })
  const [floaters, setFloaters] = useState<Floater[]>([])
  const primed = useRef(false)

  useEffect(() => {
    if (!primed.current) {
      primed.current = true
      prev.current = { preferencie, pokladna, kauzyPressure }
      return
    }

    const next: Floater[] = []
    const dPref = preferencie - prev.current.preferencie
    const dPok = pokladna - prev.current.pokladna
    const dEye = kauzyPressure - prev.current.kauzyPressure

    if (Math.abs(dPref) >= 0.05) {
      next.push({
        id: `${uid}-p-${preferencie}`,
        text: formatPrefDelta(dPref),
        kind: dPref >= 0 ? 'mint' : 'blood',
      })
    }
    if (Math.abs(dPok) >= 1) {
      next.push({
        id: `${uid}-k-${pokladna}`,
        text: formatSkDelta(dPok),
        kind: dPok >= 0 ? 'signal' : 'blood',
      })
    }
    if (dEye >= 0.4) {
      next.push({
        id: `${uid}-e-${kauzyPressure}`,
        text: `Kauza +${dEye.toFixed(1)}`,
        kind: 'blood',
      })
    }

    prev.current = { preferencie, pokladna, kauzyPressure }
    if (next.length === 0 || reduceMotion) return

    setFloaters((current) => [...current, ...next].slice(-4))
    const timer = window.setTimeout(() => {
      setFloaters((current) => current.filter((f) => !next.some((n) => n.id === f.id)))
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [preferencie, pokladna, kauzyPressure, reduceMotion, uid])

  return (
    <div className="floats" aria-hidden>
      <AnimatePresence>
        {floaters.map((floater, index) => (
          <motion.div
            key={floater.id}
            className={`floats__item floats__item--${floater.kind}`}
            style={{ left: `${18 + index * 18}%` }}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: -48, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {floater.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
