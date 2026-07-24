import { StyleSheet, Text, View } from 'react-native'
import type { DeckRunState } from '@devedesiatky/simulation'
import { quarterScore } from '@devedesiatky/simulation'
import { formatSk } from './shellModel'

export function DeckHud({ state }: { state: DeckRunState }) {
  const score = quarterScore(state)
  return (
    <View style={styles.hud} accessibilityLabel="Deck skóre">
      <View style={styles.cell}>
        <Text style={styles.label}>Preferencie</Text>
        <Text style={styles.hero}>{state.resources.preferencie.toFixed(1)}%</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.label}>Pokladňa</Text>
        <Text style={styles.value}>{formatSk(state.resources.pokladna)} Sk</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.label}>Energia</Text>
        <Text style={[styles.value, styles.signal]}>
          {state.energy}/{state.energyMax}
        </Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.label}>Kvóta</Text>
        <Text style={styles.value}>
          {score}/{state.quota}
        </Text>
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
