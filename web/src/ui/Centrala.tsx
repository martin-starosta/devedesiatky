import { motion, useReducedMotion } from 'framer-motion'
import type { DemographicId } from '../simulation'
import { useGameStore } from './useGameStore'
import './Centrala.css'

function formatDateLabel(year: number, quarter: number): string {
  const names = ['1. štvrťrok', '2. štvrťrok', '3. štvrťrok', '4. štvrťrok'] as const
  return `${names[quarter - 1]} ${year}`
}

const demographicLabelsSk: Record<DemographicId, string> = {
  narodovci: 'Národovci',
  mestania: 'Mešťania',
  robotnici: 'Robotníci',
  podnikatelia: 'Podnikatelia',
  zapadniari: 'Západniari',
  vychodniari: 'Východniari',
}

function topDemographic(
  weights: Record<DemographicId, number>,
): { id: DemographicId; weight: number } {
  const [id, weight] = (Object.entries(weights) as Array<[DemographicId, number]>).sort(
    (a, b) => b[1] - a[1],
  )[0]
  return { id, weight }
}

function koaliciaStatus(koalicia: number, inGovernment: boolean): string {
  if (!inGovernment) return 'Opozícia'
  if (koalicia >= 70) return 'Stabilná'
  if (koalicia >= 40) return 'Krehká'
  return 'Nestabilná'
}

export function Centrala({
  onOpenTimeline,
  onOpenSnem,
}: {
  onOpenTimeline?: () => void
  onOpenSnem?: () => void
}) {
  const state = useGameStore((s) => s.state)
  const advanceQuarter = useGameStore((s) => s.advanceQuarter)
  const reduceMotion = useReducedMotion()
  const top = topDemographic(state.demographicWeights)
  const eyePct = Math.round(Math.min(1, state.kauzyPressure / 12) * 100)
  const trustLow = state.reputacia < 4 || state.preferencie < 12

  return (
    <main className="centrala">
      <header className="centrala__hero" aria-label="Centrála">
        <div className="centrala__hero-copy">
          <h1 className="centrala__title">Divoké deväťdesiate</h1>
          <p className="centrala__tagline">Ty si šéf. Morálka je voliteľná.</p>
          <p className="centrala__date">{formatDateLabel(state.year, state.quarter)}</p>
        </div>
      </header>

      <motion.section
        className="centrala__hq"
        key={`${state.year}-${state.quarter}`}
        initial={reduceMotion ? false : { opacity: 0.7, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="centrala__hq-head">
          <span className="centrala__tape">Centrála strany</span>
          <span className="centrala__stamp">Bez faktúry</span>
        </div>
        <div className="centrala__hq-body">
          <div className="centrala__polaroid">
            <div className="centrala__polaroid-shot" aria-hidden />
            <p className="centrala__polaroid-cap">
              {state.inGovernment ? 'Vláda' : 'Opozícia'} · {state.offices} kancelárií
            </p>
          </div>
          <ul className="centrala__notes">
            <li className="centrala__note centrala__note--blood">
              <span>Dnes</span>
              <strong>{state.inGovernment ? 'Politika / Fond' : 'Opozičný ťah'}</strong>
            </li>
            <li className="centrala__note centrala__note--mint">
              <span>Základňa</span>
              <strong>
                {demographicLabelsSk[top.id]} {Math.round(top.weight * 100)}%
              </strong>
            </li>
            <li className="centrala__note centrala__note--signal">
              <span>Koalícia</span>
              <strong>
                {state.koalicia.toFixed(0)} · {koaliciaStatus(state.koalicia, state.inGovernment)}
              </strong>
            </li>
            <li className="centrala__note">
              <span>Dôvera</span>
              <strong>{trustLow ? 'Nízka' : 'Drží'}</strong>
            </li>
          </ul>
        </div>
      </motion.section>

      <section className="centrala__tiles" aria-label="Stav strany">
        <article className="centrala__tile">
          <span className="centrala__tile-mark centrala__tile-mark--megaphone" aria-hidden />
          <h2>Voličský stroj</h2>
          <p>{demographicLabelsSk[top.id]}</p>
          <strong>{state.preferencie.toFixed(1)}%</strong>
        </article>
        <article className="centrala__tile">
          <span className="centrala__tile-mark centrala__tile-mark--board" aria-hidden />
          <h2>Kampaň</h2>
          <p>Kancelárie v krajoch</p>
          <strong>Lv. {state.offices}</strong>
        </article>
        <article className="centrala__tile">
          <span className="centrala__tile-mark centrala__tile-mark--tv" aria-hidden />
          <h2>Mediálny dosah</h2>
          <p>Kontrola priestoru</p>
          <strong>{state.media.toFixed(0)}</strong>
        </article>
        <article className="centrala__tile">
          <span className="centrala__tile-mark centrala__tile-mark--crew" aria-hidden />
          <h2>Kádre</h2>
          <p>Reputácia vonku</p>
          <strong>{state.reputacia.toFixed(1)}</strong>
        </article>
        <button
          type="button"
          className="centrala__tile centrala__tile--btn"
          onClick={onOpenSnem}
          disabled={!onOpenSnem}
        >
          <span className="centrala__tile-mark centrala__tile-mark--map" aria-hidden />
          <h2>Krajina</h2>
          <p>Snem a mandáty</p>
          <strong>Snem →</strong>
        </button>
        <button
          type="button"
          className="centrala__tile centrala__tile--btn centrala__tile--danger"
          onClick={onOpenTimeline}
          disabled={!onOpenTimeline}
        >
          <span className="centrala__tile-mark centrala__tile-mark--eye" aria-hidden />
          <h2>Kauzy</h2>
          <p>{state.kauzy.length} v ledgeri</p>
          <strong>{eyePct}% oko</strong>
        </button>
      </section>

      <div className="centrala__rail">
        <button
          type="button"
          className="centrala__side"
          onClick={onOpenTimeline}
          disabled={!onOpenTimeline}
        >
          <span>Časová os</span>
          <small>{state.collectedFactIds.length} faktov</small>
        </button>
        <button type="button" className="centrala__cta" onClick={advanceQuarter}>
          Spustiť ťah
          <small>Politika, fond, kauzy</small>
        </button>
        <button
          type="button"
          className="centrala__side"
          onClick={onOpenSnem}
          disabled={!onOpenSnem}
        >
          <span>Snem</span>
          <small>Mandáty</small>
        </button>
      </div>
    </main>
  )
}
