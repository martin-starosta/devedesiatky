import { politikaActions } from '../content/politika'
import { availablePolitikaActions } from '../simulation'
import { useGameStore } from './useGameStore'
import './PolitikaScreen.css'

export function PolitikaScreen() {
  const state = useGameStore((s) => s.state)
  const spendPolitika = useGameStore((s) => s.spendPolitika)
  const finishPolitika = useGameStore((s) => s.finishPolitika)
  const actions = availablePolitikaActions(state.inGovernment)

  return (
    <main className="politika">
      <header className="politika__brand">
        <p className="politika__eyebrow">Politika</p>
        <h1 className="politika__title">
          {state.inGovernment ? 'Vláda' : 'Opozícia'}
        </h1>
        <p className="politika__lede">
          AP: <strong>{state.actionPoints}</strong>. Utratíš teraz, kauzy prídu neskôr.
        </p>
      </header>

      <section className="politika__stats" aria-label="Zdroje">
        <div>
          <span>Preferencie</span>
          <strong>{state.preferencie.toFixed(1)} %</strong>
        </div>
        <div>
          <span>Reputácia</span>
          <strong>{state.reputacia.toFixed(1)}</strong>
        </div>
        <div>
          <span>Médiá</span>
          <strong>{state.media.toFixed(1)}</strong>
        </div>
      </section>

      <section className="politika__actions" aria-label="Akcie">
        {actions.map((id) => {
          const def = politikaActions[id]
          return (
            <button
              key={id}
              type="button"
              className="politika__action"
              disabled={state.actionPoints <= 0}
              onClick={() => spendPolitika(id)}
            >
              <strong>{def.labelSk}</strong>
              <span>{def.blurbSk}</span>
            </button>
          )
        })}
      </section>

      <button type="button" className="politika__cta" onClick={finishPolitika}>
        {state.inGovernment ? 'Ďalej: Fond' : 'Hotovo'}
      </button>
    </main>
  )
}
