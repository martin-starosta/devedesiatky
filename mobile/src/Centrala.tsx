import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { DemographicId, GameState } from '@devedesiatky/simulation'
import { formatDateLabel } from './shellModel'
import { useReducedMotion } from './useReducedMotion'

const demographicLabelsSk: Record<DemographicId, string> = {
  narodovci: 'Národovci',
  mestania: 'Mešťania',
  robotnici: 'Robotníci',
  podnikatelia: 'Podnikatelia',
  zapadniari: 'Západniari',
  vychodniari: 'Východniari',
}

function topDemographic(weights: Record<DemographicId, number>): {
  id: DemographicId
  weight: number
} {
  const [id, weight] = (Object.entries(weights) as Array<[DemographicId, number]>).sort(
    (a, b) => b[1] - a[1],
  )[0]
  return { id, weight }
}

function koaliciaStatus(koalicia: number, inGovernment: boolean): string {
  if (!inGovernment) return 'Opozícia'
  if (koalicia >= 70) return 'Stabilná'
  if (koalicia >= 40) return 'Krehká'
  return 'Nestabilná'
}

export function Centrala({
  state,
  onAdvanceQuarter,
  onOpenSnem,
  onOpenTimeline,
  onNewGame,
}: {
  state: GameState
  onAdvanceQuarter: () => void
  onOpenSnem?: () => void
  onOpenTimeline?: () => void
  onNewGame?: () => void
}) {
  const reduceMotion = useReducedMotion()
  const top = topDemographic(state.demographicWeights)
  const eyePct = Math.round(Math.min(1, state.kauzyPressure / 12) * 100)

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, reduceMotion ? null : styles.scrollMotion]}
      accessibilityLabel="Centrála"
    >
      <Text style={styles.date}>{formatDateLabel(state.year, state.quarter)}</Text>

      <View style={styles.hq}>
        <Text style={styles.tape}>Centrála strany</Text>
        <Text style={styles.note}>
          {state.inGovernment ? 'Vláda' : 'Opozícia'} · {state.offices} kancelárií
        </Text>
        <Text style={styles.note}>
          Základňa: {demographicLabelsSk[top.id]} {Math.round(top.weight * 100)}%
        </Text>
        <Text style={styles.note}>
          Koalícia: {state.koalicia.toFixed(0)} ·{' '}
          {koaliciaStatus(state.koalicia, state.inGovernment)}
        </Text>
        <Text style={styles.note}>Kauzy oko: {eyePct}%</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={styles.cta}
        onPress={onAdvanceQuarter}
      >
        <Text style={styles.ctaLabel}>Spustiť ťah</Text>
        <Text style={styles.ctaSub}>Politika, fond, kauzy</Text>
      </Pressable>

      <View style={styles.sideRow}>
        <Pressable
          accessibilityRole="button"
          style={styles.side}
          onPress={onOpenSnem}
          disabled={!onOpenSnem}
        >
          <Text style={styles.sideLabel}>Snem</Text>
          <Text style={styles.sideSub}>Mandáty</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.side}
          onPress={onOpenTimeline}
          disabled={!onOpenTimeline}
        >
          <Text style={styles.sideLabel}>Časová os</Text>
          <Text style={styles.sideSub}>{state.collectedFactIds.length} faktov</Text>
        </Pressable>
      </View>

      {onNewGame ? (
        <Pressable accessibilityRole="button" style={styles.secondary} onPress={onNewGame}>
          <Text style={styles.secondaryLabel}>Nová hra</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 10,
    paddingBottom: 32,
  },
  scrollMotion: {
    opacity: 1,
  },
  date: {
    color: '#c4a484',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  hq: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 14,
    gap: 6,
    backgroundColor: '#1f1216',
  },
  tape: {
    color: '#c45c26',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  note: {
    color: '#e8e2d6',
    fontSize: 14,
  },
  cta: {
    marginTop: 12,
    backgroundColor: '#c45c26',
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignSelf: 'flex-start',
  },
  ctaLabel: {
    color: '#fff8f0',
    fontSize: 16,
    fontWeight: '800',
  },
  ctaSub: {
    color: '#ffd8c0',
    fontSize: 12,
    marginTop: 2,
  },
  sideRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  side: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 12,
    gap: 2,
  },
  sideLabel: {
    color: '#f4e6c8',
    fontWeight: '700',
    fontSize: 14,
  },
  sideSub: {
    color: '#9a8a7a',
    fontSize: 12,
  },
  secondary: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  secondaryLabel: {
    color: '#c4a484',
    fontSize: 14,
    fontWeight: '600',
  },
})
