import { useState } from 'react'
import { partyPresets, type PartyPreset } from '../content/partyFounding'
import { neutralIdeology, type Ideology, type PartyPresetId } from '../simulation'
import { useGameStore } from './useGameStore'
import './SetupParty.css'

const presetList = Object.values(partyPresets) as PartyPreset[]

function SliderRow(props: {
  left: string
  right: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="setup__slider">
      <span className="setup__slider-ends">
        <span>{props.left}</span>
        <span>{props.right}</span>
      </span>
      <input
        type="range"
        min={-1}
        max={1}
        step={0.05}
        value={props.value}
        onChange={(event) => props.onChange(Number(event.target.value))}
      />
    </label>
  )
}

export function SetupParty() {
  const foundParty = useGameStore((s) => s.foundParty)
  const [ideology, setIdeology] = useState<Ideology>(neutralIdeology)
  const [selectedPreset, setSelectedPreset] = useState<PartyPresetId | null>(null)

  const applyPreset = (preset: PartyPreset) => {
    setSelectedPreset(preset.id)
    setIdeology(preset.ideology)
  }

  const startRun = () => {
    if (selectedPreset) {
      foundParty({ preset: selectedPreset, ideology })
      return
    }
    foundParty({ ideology })
  }

  return (
    <main className="setup">
      <header className="setup__brand">
        <p className="setup__eyebrow">Založ stranu</p>
        <h1 className="setup__title">Divoké deväťdesiate</h1>
        <p className="setup__lede">
          Tri osi ideológie určia tvoju voličskú základňu. Alebo si vyber hotový štart.
        </p>
      </header>

      <section className="setup__presets" aria-label="Predvoľby">
        {presetList.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={
              selectedPreset === preset.id
                ? 'setup__preset setup__preset--active'
                : 'setup__preset'
            }
            onClick={() => applyPreset(preset)}
          >
            <strong>{preset.labelSk}</strong>
            <span>{preset.blurbSk}</span>
          </button>
        ))}
      </section>

      <section className="setup__sliders" aria-label="Ideologické osi">
        <SliderRow
          left="Národný"
          right="Občiansky"
          value={ideology.narodnyObciansky}
          onChange={(narodnyObciansky) => {
            setSelectedPreset(null)
            setIdeology((prev) => ({ ...prev, narodnyObciansky }))
          }}
        />
        <SliderRow
          left="Sociálny"
          right="Trhový"
          value={ideology.socialnyTrhovy}
          onChange={(socialnyTrhovy) => {
            setSelectedPreset(null)
            setIdeology((prev) => ({ ...prev, socialnyTrhovy }))
          }}
        />
        <SliderRow
          left="Východ"
          right="Západ"
          value={ideology.vychodZapad}
          onChange={(vychodZapad) => {
            setSelectedPreset(null)
            setIdeology((prev) => ({ ...prev, vychodZapad }))
          }}
        />
      </section>

      <button type="button" className="setup__cta" onClick={startRun}>
        Založiť stranu
      </button>
    </main>
  )
}
