import { companies, sponsors, sponsorIds } from '../content/patronage'
import type { FnmDestination, SponsorId } from '../simulation'
import { useGameStore } from './useGameStore'
import './FnmScreen.css'

function formatSk(amount: number): string {
  return `${Math.round(amount).toLocaleString('sk-SK')} Sk`
}

export function FnmScreen() {
  const state = useGameStore((s) => s.state)
  const assignFnm = useGameStore((s) => s.assignFnm)
  const finishPeniaze = useGameStore((s) => s.finishPeniaze)

  const assign = (companyId: (typeof state.fnmOffered)[number], destination: FnmDestination) => {
    assignFnm(companyId, destination)
  }

  return (
    <main className="fnm">
      <header className="fnm__brand">
        <p className="fnm__eyebrow">Fond národného majetku</p>
        <h1 className="fnm__title">Rozdávaj</h1>
        <p className="fnm__lede">
          Štyri cesty: sponzor (cash + kauza), partner (koalícia), súťaž (reputácia), alebo odklad.
        </p>
        <p className="fnm__koalicia">
          Koalícia: <strong>{state.koalicia.toFixed(0)}</strong>
        </p>
      </header>

      <section className="fnm__sponsors" aria-label="Sponzori">
        {sponsorIds.map((id) => {
          const sponsor = sponsors[id]
          return (
            <div key={id} className="fnm__sponsor" data-sponsor={id}>
              <strong>{sponsor.nameSk}</strong>
              <span>
                Štedrosť {(sponsor.generosity * 100).toFixed(0)}% · riziko{' '}
                {sponsor.riskiness.toFixed(1)}
              </span>
            </div>
          )
        })}
      </section>

      <section className="fnm__companies" aria-label="Podniky na privatizáciu">
        {state.fnmOffered.map((companyId) => {
          const company = companies[companyId]
          return (
            <article key={companyId} className="fnm__company">
              <div>
                <h2>{company.nameSk}</h2>
                <p>
                  {company.regionSk} · knižná hodnota {formatSk(company.bookValue)}
                </p>
              </div>
              <div className="fnm__assign">
                {(Object.keys(sponsors) as SponsorId[]).map((sponsorId) => (
                  <button
                    key={sponsorId}
                    type="button"
                    className="fnm__assign-btn"
                    onClick={() =>
                      assign(companyId, { kind: 'sponsor', sponsorId })
                    }
                  >
                    Sponzor: {sponsors[sponsorId].nameSk}
                  </button>
                ))}
                <button
                  type="button"
                  className="fnm__assign-btn"
                  onClick={() => assign(companyId, { kind: 'partner' })}
                >
                  Koaličný partner
                </button>
                <button
                  type="button"
                  className="fnm__assign-btn"
                  onClick={() => assign(companyId, { kind: 'auction' })}
                >
                  Verejná súťaž
                </button>
                <button
                  type="button"
                  className="fnm__assign-btn fnm__assign-btn--danger"
                  onClick={() => assign(companyId, { kind: 'cancel' })}
                >
                  Zrušiť / odložiť
                </button>
              </div>
            </article>
          )
        })}
      </section>

      <button type="button" className="fnm__cta" onClick={finishPeniaze}>
        Hotovo, späť
      </button>
    </main>
  )
}
