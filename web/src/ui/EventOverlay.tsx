import { factCards, timelineEventsById } from '@devedesiatky/content'
import { choicesForEvent } from '@devedesiatky/simulation'
import { useGameStore } from './useGameStore'
import './EventOverlay.css'

export function EventOverlay() {
  const state = useGameStore((s) => s.state)
  const resolveEvent = useGameStore((s) => s.resolveEvent)
  if (!state.activeEventId) return null

  const event = timelineEventsById[state.activeEventId]
  const choices = choicesForEvent(state)

  return (
    <main className="event">
      <header className="event__brand">
        <p className="event__eyebrow">Udalosť · {event.year} Q{event.quarter}</p>
        <h1 className="event__title">{event.titleSk}</h1>
        <p className="event__lede">{event.bodySk}</p>
      </header>

      <section className="event__choices" aria-label="Voľby">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className="event__choice"
            onClick={() => resolveEvent(choice.id)}
          >
            {choice.labelSk}
          </button>
        ))}
      </section>
    </main>
  )
}

export function FactOverlay() {
  const state = useGameStore((s) => s.state)
  const collectFact = useGameStore((s) => s.collectFact)
  const dismissFact = useGameStore((s) => s.dismissFact)
  if (!state.pendingFactId) return null

  const fact = factCards[state.pendingFactId]

  return (
    <main className="event event--fact">
      <header className="event__brand">
        <p className="event__eyebrow">Čo sa naozaj stalo</p>
        <h1 className="event__title">{fact.titleSk}</h1>
        <p className="event__lede">{fact.bodySk}</p>
        <p className="event__source">{fact.sourceHook}</p>
      </header>
      <div className="event__fact-actions">
        <button type="button" className="event__choice" onClick={collectFact}>
          Uložiť na časovú os
        </button>
        <button type="button" className="event__choice event__choice--ghost" onClick={dismissFact}>
          Preskočiť
        </button>
      </div>
    </main>
  )
}
