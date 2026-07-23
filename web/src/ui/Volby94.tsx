import { useState } from 'react'
import { npcArchetypes } from '../content/npcParties'
import {
  campaignChannels,
  campaignRegions,
  coalitionPosts,
  institutions,
  type CampaignChannel,
  type CampaignRegion,
  type CoalitionPost,
  type InstitutionId,
} from '../content/volby94'
import type { NpcArchetypeId } from '../simulation'
import { useGameStore } from './useGameStore'
import './Volby94.css'

const regionLabelsSk: Record<CampaignRegion, string> = {
  zapad: 'Západ',
  stred: 'Stred',
  vychod: 'Východ',
}

function formatSk(amount: number): string {
  return `${Math.round(amount).toLocaleString('sk-SK')} Sk`
}

export function VolbyKampan() {
  const state = useGameStore((s) => s.state)
  const campaignSpend = useGameStore((s) => s.campaignSpend)
  const finishCampaign = useGameStore((s) => s.finishCampaign)
  const [region, setRegion] = useState<CampaignRegion>('vychod')
  const [channel, setChannel] = useState<CampaignChannel>('rallies')
  const [amount, setAmount] = useState(20_000)
  const election = state.election

  if (!election) return null

  return (
    <main className="volby">
      <header className="volby__brand">
        <p className="volby__eyebrow">Voľby ’94 · kampaň</p>
        <h1 className="volby__title">Kolo {election.campaignRound}/{election.maxRounds}</h1>
        <p className="volby__lede">
          Pokladňa {formatSk(state.pokladna)} · preferencie +{election.totalBoost.toFixed(1)}
        </p>
      </header>

      <div className="volby__row">
        <label>
          Región
          <select value={region} onChange={(e) => setRegion(e.target.value as CampaignRegion)}>
            {campaignRegions.map((id) => (
              <option key={id} value={id}>
                {regionLabelsSk[id]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kanál
          <select value={channel} onChange={(e) => setChannel(e.target.value as CampaignChannel)}>
            {(Object.keys(campaignChannels) as CampaignChannel[]).map((id) => (
              <option key={id} value={id}>
                {campaignChannels[id].labelSk}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="volby__amount">
        Výdavok
        <input
          type="number"
          min={5000}
          step={5000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
        />
      </label>

      <ul className="volby__boosts">
        {campaignRegions.map((id) => (
          <li key={id}>
            <strong>{regionLabelsSk[id]}</strong>: +{election.boostByRegion[id].toFixed(1)}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="volby__cta"
        onClick={() => campaignSpend({ region, channel, amount })}
        disabled={amount <= 0 || state.pokladna < amount}
      >
        Minúť na kampaň
      </button>
      <button type="button" className="volby__link" onClick={finishCampaign}>
        {election.campaignRound < election.maxRounds ? 'Ďalšie kolo' : 'Na volebnú noc'}
      </button>
    </main>
  )
}

export function VolbyNoc() {
  const state = useGameStore((s) => s.state)
  const resolveElectionNight = useGameStore((s) => s.resolveElectionNight)
  const continueAfterNight = useGameStore((s) => s.continueAfterNight)
  const election = state.election
  if (!election) return null

  const exit = election.exitPoll
  const final = election.finalShare
  const needle = final ?? state.preferencie + election.totalBoost

  return (
    <main className="volby">
      <header className="volby__brand">
        <p className="volby__eyebrow">Voľby ’94 · volebná noc</p>
        <h1 className="volby__title">Volebná ihla</h1>
        <p className="volby__lede">Predbežný prieskum oproti sčítaniu.</p>
      </header>

      <div className="volby__needle" aria-label={`Preferencie ${needle.toFixed(1)} percent`}>
        <div className="volby__needle-track">
          <span
            className="volby__needle-fill"
            style={{ width: `${Math.min(100, Math.max(0, needle) * 2.2)}%` }}
          />
        </div>
        <p className="volby__ticker">
          {exit == null
            ? `Predbežne ${needle.toFixed(1)} %`
            : `Prieskum ${exit.toFixed(1)} % · výsledok ${final?.toFixed(1)} % · ${election.won ? 'víťazstvo' : 'prehra'}`}
        </p>
      </div>

      {exit == null ? (
        <button type="button" className="volby__cta" onClick={resolveElectionNight}>
          Spustiť sčítanie
        </button>
      ) : (
        <button type="button" className="volby__cta" onClick={continueAfterNight}>
          {election.won ? 'Skladať vládu' : 'Ísť do opozície'}
        </button>
      )}
    </main>
  )
}

export function VolbyKoalicia() {
  const state = useGameStore((s) => s.state)
  const offerCoalition = useGameStore((s) => s.offerCoalition)
  const finishCoalition = useGameStore((s) => s.finishCoalition)
  const skipNocNozov = useGameStore((s) => s.skipNocNozov)
  const [partnerId, setPartnerId] = useState<NpcArchetypeId | ''>('')
  const [posts, setPosts] = useState<CoalitionPost[]>(['culture'])
  const election = state.election
  if (!election) return null

  const partners = state.npcParties

  function togglePost(post: CoalitionPost) {
    setPosts((prev) => (prev.includes(post) ? prev.filter((p) => p !== post) : [...prev, post]))
  }

  return (
    <main className="volby">
      <header className="volby__brand">
        <p className="volby__eyebrow">Voľby ’94 · skladanie vlády</p>
        <h1 className="volby__title">Ponuka partnerovi</h1>
        <p className="volby__lede">Vnútro je drahé: tlmí kauzy, partner si ho cení.</p>
      </header>

      <label>
        Partner
        <select
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value as NpcArchetypeId | '')}
        >
          <option value="">Vyber stranu</option>
          {partners.map((npc) => (
            <option key={npc.id} value={npc.id}>
              {npcArchetypes[npc.id].labelSk}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="volby__posts">
        <legend>Rezorty</legend>
        {(Object.keys(coalitionPosts) as CoalitionPost[]).map((post) => (
          <label key={post} className="volby__check">
            <input
              type="checkbox"
              checked={posts.includes(post)}
              onChange={() => togglePost(post)}
            />
            {coalitionPosts[post].labelSk}
            {post === 'interior' ? ' (drahé)' : ''}
          </label>
        ))}
      </fieldset>

      {election.coalitionPartnerId ? (
        <p className="volby__ok">
          Partner {npcArchetypes[election.coalitionPartnerId].labelSk} prijal ponuku. Koalícia{' '}
          {state.koalicia.toFixed(0)}.
        </p>
      ) : election.offeredPosts.length > 0 ? (
        <p className="volby__warn">Partner odmietol. Posilni ponuku (skús Vnútro / FNM).</p>
      ) : null}

      <button
        type="button"
        className="volby__cta"
        disabled={!partnerId || posts.length === 0}
        onClick={() => partnerId && offerCoalition({ partnerId, posts })}
      >
        Ponúknuť
      </button>
      <button
        type="button"
        className="volby__link"
        disabled={!election.coalitionPartnerId}
        onClick={finishCoalition}
      >
        Noc dlhých nožov
      </button>
      <button
        type="button"
        className="volby__link"
        disabled={!election.coalitionPartnerId}
        onClick={skipNocNozov}
      >
        Preskočiť noc
      </button>
    </main>
  )
}

export function VolbyNocNozo() {
  const state = useGameStore((s) => s.state)
  const assignInstitution = useGameStore((s) => s.assignInstitution)
  const finishNocNozov = useGameStore((s) => s.finishNocNozov)
  const election = state.election
  if (!election || !election.coalitionPartnerId) return null

  const partnerId = election.coalitionPartnerId
  const partnerLabel = npcArchetypes[partnerId].labelSk

  return (
    <main className="volby">
      <header className="volby__brand">
        <p className="volby__eyebrow">Noc dlhých nožov</p>
        <h1 className="volby__title">Rozdel inštitúcie</h1>
        <p className="volby__lede">Priraď karty sebe alebo partnerovi ({partnerLabel}).</p>
      </header>

      <ul className="volby__institutions">
        {(Object.keys(institutions) as InstitutionId[]).map((id) => (
          <li key={id} className="volby__institution">
            <strong>{institutions[id].labelSk}</strong>
            <div className="volby__assign">
              <button
                type="button"
                className={
                  election.institutions[id] === 'player'
                    ? 'volby__chip volby__chip--on'
                    : 'volby__chip'
                }
                onClick={() => assignInstitution({ institutionId: id, assigneeId: 'player' })}
              >
                Ty
              </button>
              <button
                type="button"
                className={
                  election.institutions[id] === partnerId
                    ? 'volby__chip volby__chip--on'
                    : 'volby__chip'
                }
                onClick={() => assignInstitution({ institutionId: id, assigneeId: partnerId })}
              >
                {partnerLabel}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button type="button" className="volby__cta" onClick={finishNocNozov}>
        Uzavrieť noc
      </button>
    </main>
  )
}
