import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { partyPresets, type PartyPreset } from '@devedesiatky/content'
import { neutralIdeology, type Ideology, type PartyPresetId } from '@devedesiatky/simulation'

const presetList = Object.values(partyPresets) as PartyPreset[]

type Props = {
  onFound: (input: { ideology?: Ideology; preset?: PartyPresetId }) => void
}

function AxisSlider(props: {
  left: string
  right: string
  value: number
  onChange: (value: number) => void
}) {
  const pct = ((props.value + 1) / 2) * 100
  return (
    <View style={styles.axis} accessibilityLabel={`${props.left}–${props.right}`}>
      <View style={styles.axisEnds}>
        <Text style={styles.axisLabel}>{props.left}</Text>
        <Text style={styles.axisLabel}>{props.right}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.thumb, { left: `${pct}%` }]} />
      </View>
      <View style={styles.axisButtons}>
        <Pressable
          accessibilityRole="button"
          onPress={() => props.onChange(Math.max(-1, props.value - 0.25))}
          style={styles.nudge}
        >
          <Text style={styles.nudgeLabel}>−</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => props.onChange(Math.min(1, props.value + 0.25))}
          style={styles.nudge}
        >
          <Text style={styles.nudgeLabel}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

export function SetupParty({ onFound }: Props) {
  const [ideology, setIdeology] = useState<Ideology>({ ...neutralIdeology })
  const [selectedPreset, setSelectedPreset] = useState<PartyPresetId | null>(null)

  function applyPreset(preset: PartyPreset) {
    setSelectedPreset(preset.id)
    setIdeology({ ...preset.ideology })
  }

  function startRun() {
    if (selectedPreset) {
      onFound({ preset: selectedPreset, ideology })
      return
    }
    onFound({ ideology })
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>Nová partia</Text>
      <Text style={styles.title}>Divoké deväťdesiate</Text>
      <Text style={styles.lede}>
        Nastav ideológiu, zober hotový archetype, alebo choď all-in na vlastný mix.
      </Text>

      <Text style={styles.section}>Predvoľby</Text>
      {presetList.map((preset) => {
        const active = selectedPreset === preset.id
        return (
          <Pressable
            key={preset.id}
            accessibilityRole="button"
            onPress={() => applyPreset(preset)}
            style={[styles.preset, active && styles.presetActive]}
          >
            <Text style={styles.presetTitle}>{preset.labelSk}</Text>
            <Text style={styles.presetBlurb}>{preset.blurbSk}</Text>
          </Pressable>
        )
      })}

      <Text style={styles.section}>Ideologické osi</Text>
      <AxisSlider
        left="Národný"
        right="Občiansky"
        value={ideology.narodnyObciansky}
        onChange={(narodnyObciansky) => {
          setSelectedPreset(null)
          setIdeology((prev) => ({ ...prev, narodnyObciansky }))
        }}
      />
      <AxisSlider
        left="Sociálny"
        right="Trhový"
        value={ideology.socialnyTrhovy}
        onChange={(socialnyTrhovy) => {
          setSelectedPreset(null)
          setIdeology((prev) => ({ ...prev, socialnyTrhovy }))
        }}
      />
      <AxisSlider
        left="Východ"
        right="Západ"
        value={ideology.vychodZapad}
        onChange={(vychodZapad) => {
          setSelectedPreset(null)
          setIdeology((prev) => ({ ...prev, vychodZapad }))
        }}
      />

      <Pressable accessibilityRole="button" style={styles.cta} onPress={startRun}>
        <Text style={styles.ctaLabel}>Do boja</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#c4a484',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f4e6c8',
    letterSpacing: -0.5,
  },
  lede: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9a8a7a',
    marginBottom: 8,
  },
  section: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#c4a484',
  },
  preset: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 14,
    gap: 4,
  },
  presetActive: {
    borderColor: '#c45c26',
    backgroundColor: '#2a1814',
  },
  presetTitle: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: '700',
  },
  presetBlurb: {
    color: '#9a8a7a',
    fontSize: 13,
    lineHeight: 18,
  },
  axis: {
    gap: 8,
    marginBottom: 4,
  },
  axisEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabel: {
    color: '#c4a484',
    fontSize: 12,
  },
  track: {
    height: 4,
    backgroundColor: '#3a2a28',
    borderRadius: 2,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: -6,
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#c45c26',
  },
  axisButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  nudge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#2a1814',
  },
  nudgeLabel: {
    color: '#f4e6c8',
    fontSize: 16,
    fontWeight: '700',
  },
  cta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#c45c26',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaLabel: {
    color: '#fff8f0',
    fontSize: 16,
    fontWeight: '700',
  },
})
