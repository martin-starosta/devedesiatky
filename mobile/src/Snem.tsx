import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { snemField, type GameState } from '@devedesiatky/simulation'

export function Snem({ state, onClose }: { state: GameState; onClose: () => void }) {
  const field = snemField(state)

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Snem">
      <Text style={styles.eyebrow}>Snem</Text>
      <Text style={styles.title}>Rozloženie síl</Text>
      <Text style={styles.lede}>
        Koalícia {field.coalitionSeats} / {field.majority} na väčšinu
        {field.holdsMajority ? ' · drží' : ' · nedrží'}
      </Text>

      <View
        style={styles.hub}
        accessibilityLabel={`Snem, koalícia ${field.coalitionSeats} mandátov z ${field.majority}`}
      >
        <Text style={styles.hubValue}>{field.coalitionSeats}</Text>
        <Text style={styles.hubSub}>koalícia · {field.totalSeats} mandátov</Text>
      </View>

      {field.arcs.map((arc) => (
        <View key={arc.id} style={[styles.row, arc.isAntagonist && styles.rowFoe]}>
          <View style={[styles.swatch, { backgroundColor: arc.color }]} />
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{arc.labelSk}</Text>
            <Text style={styles.rowMeta}>
              {arc.seats} · {arc.preferencie.toFixed(1)}%
              {arc.inGovernment ? ' · vláda' : ''}
              {arc.isAntagonist ? ' · súper' : ''}
            </Text>
          </View>
        </View>
      ))}

      <Pressable accessibilityRole="button" style={styles.cta} onPress={onClose}>
        <Text style={styles.ctaLabel}>Späť do centrály</Text>
      </Pressable>
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
  eyebrow: {
    color: '#c4a484',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#f4e6c8',
    fontSize: 24,
    fontWeight: '800',
  },
  lede: {
    color: '#9a8a7a',
    fontSize: 14,
    lineHeight: 20,
  },
  hub: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#1f1216',
    marginVertical: 4,
  },
  hubValue: {
    color: '#f4e6c8',
    fontSize: 36,
    fontWeight: '800',
  },
  hubSub: {
    color: '#9a8a7a',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 12,
  },
  rowFoe: {
    borderColor: '#6a3030',
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: '#f0f0f0',
    fontWeight: '700',
    fontSize: 15,
  },
  rowMeta: {
    color: '#9a8a7a',
    fontSize: 13,
  },
  cta: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#c45c26',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  ctaLabel: {
    color: '#fff8f0',
    fontSize: 15,
    fontWeight: '700',
  },
})
