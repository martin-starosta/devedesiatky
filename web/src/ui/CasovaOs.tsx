import { factCards } from '../content/timeline'
import { useGameStore } from './useGameStore'
import './CasovaOs.css'

export function CasovaOs({ onClose }: { onClose: () => void }) {
  const collected = useGameStore((s) => s.state.collectedFactIds)

  return (
    <main className="casova">
      <header className="casova__brand">
        <p className="casova__eyebrow">Časová os</p>
        <h1 className="casova__title">Čo si otvoril</h1>
        <p className="casova__lede">
          {collected.length === 0
            ? 'Zatiaľ žiadne fact cards. Po udalostiach ich môžeš uložiť.'
            : `${collected.length} kartičiek z behu.`}
        </p>
      </header>

      <ol className="casova__list">
        {collected.map((id) => {
          const fact = factCards[id]
          return (
            <li key={id} className="casova__item">
              <strong>{fact.titleSk}</strong>
              <p>{fact.bodySk}</p>
            </li>
          )
        })}
      </ol>

      <button type="button" className="casova__cta" onClick={onClose}>
        Späť do centrály
      </button>
    </main>
  )
}
