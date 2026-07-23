import { StyleSheet, Text, View } from 'react-native'
import type { GameState } from '@devedesiatky/simulation'
import { formatSk, koaliciaHint } from './shellModel'
import { useReducedMotion } from './useReducedMotion'

export function HudStrip({ state }: { state: GameState }) {
  const reduceMotion = useReducedMotion()
  const eyeLevel = Math.min(1, state.kauzyPressure / 12)
  const eyePct = Math.round(eyeLevel * 100)

  return (
    <View
      style={[styles.hud, reduceMotion ? null : styles.hudMotion]}
      accessibilityLabel="Skóre"
    >
      <View style={styles.cell}>
        <Text style={styles.label}>Preferencie</Text>
        <Text style={styles.hero}>{state.preferencie.toFixed(1)}%</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.label}>Pokladňa</Text>
        <Text style={styles.value}>{formatSk(state.pokladna)} Sk</Text>
      </View>
      {state.turnPhase === 'politika' ? (
        <View style={styles.cell}>
          <Text style={styles.label}>AP</Text>
          <Text style={[styles.value, styles.signal]}>{state.actionPoints}</Text>
        </View>
      ) : (
        <View style={styles.cell}>
          <Text style={styles.label}>Koalícia</Text>
          <Text style={styles.value}>
            {state.koalicia.toFixed(0)} {koaliciaHint(state.koalicia, state.inGovernment)}
          </Text>
        </View>
      )}
      <View
        style={styles.cell}
        accessibilityLabel={`Kauzy tlak ${state.kauzyPressure.toFixed(1)}`}
      >
        <Text style={styles.label}>Kauza</Text>
        <Text style={styles.value}>{eyePct}%</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  hud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a2a28',
    backgroundColor: '#140c0e',
  },
  hudMotion: {
    // Subtle presence without animation libraries; skipped when reduced-motion.
    opacity: 1,
  },
  cell: {
    minWidth: '22%',
    flexGrow: 1,
  },
  label: {
    color: '#9a8a7a',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  hero: {
    color: '#f4e6c8',
    fontSize: 18,
    fontWeight: '800',
  },
  value: {
    color: '#e8e2d6',
    fontSize: 14,
    fontWeight: '700',
  },
  signal: {
    color: '#c45c26',
  },
})
