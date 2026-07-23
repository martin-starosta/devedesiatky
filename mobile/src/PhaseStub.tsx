import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { TurnPhase } from '@devedesiatky/simulation'

const labels: Partial<Record<TurnPhase, string>> = {
  politika: 'Politika',
  peniaze: 'Fond národného majetku',
  event: 'Udalosť',
  fact: 'Fakt',
  'volby-kampan': 'Volebná kampaň',
  'volby-noc': 'Volebná noc',
  'volby-koalicia': 'Koalícia',
  'volby-noc-nozo': 'Noc dlhých nožov',
}

/** Temporary stage until dedicated native screens land (#20–#24). */
export function PhaseStub({
  phase,
  onContinue,
}: {
  phase: TurnPhase
  onContinue?: () => void
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>Fáza ťahu</Text>
      <Text style={styles.title}>{labels[phase] ?? phase}</Text>
      <Text style={styles.body}>
        Obrazovka sa pripravuje. Shell už sleduje turnPhase — pokračuj ďalej v ťahu.
      </Text>
      {onContinue ? (
        <Pressable accessibilityRole="button" style={styles.cta} onPress={onContinue}>
          <Text style={styles.ctaLabel}>Pokračovať</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 10,
  },
  eyebrow: {
    color: '#c4a484',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#f4e6c8',
    fontSize: 24,
    fontWeight: '800',
  },
  body: {
    color: '#9a8a7a',
    fontSize: 14,
    lineHeight: 20,
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
    fontWeight: '700',
    fontSize: 15,
  },
})
