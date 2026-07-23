import { companies, sponsors, sponsorIds } from '../content/patronage'
import type { SponsorId } from '../simulation'
import { useGameStore } from './useGameStore'
import './FnmScreen.css'

function formatSk(amount: number): string {
  return `${Math.round(amount).toLocaleString('sk-SK')} Sk`
}

export function FnmScreen() {
  const state = useGameStore((s) => s.state)
  const assignToSponsor = useGameStore((s) => s.assignToSponsor)
  const finishPeniaze = useGameStore((s) => s.finishPeniaze)

  return (
    <main className="fnm">
      <header className="fnm__brand">
        <p className="fnm__eyebrow">Fond národného majetku</p>
        <h1 className="fnm__title">Peniaze</h1>
        <p className="fnm__lede">
          Priraď podnik sponzorovi — hotovosť do pokladne, kauza do ledgera, preferencie sa pohýbu.
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
                    onClick={() => assignToSponsor(companyId, sponsorId)}
                  >
                    → {sponsors[sponsorId].nameSk}
                  </button>
                ))}
              </div>
            </article>
          )
        })}
      </section>

      <button type="button" className="fnm__cta" onClick={finishPeniaze}>
        Hotovo — späť do centrály
      </button>
    </main>
  )
}
