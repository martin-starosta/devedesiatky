import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { politikaActions } from '@devedesiatky/content'
import { availablePolitikaActions, type GameState, type PolitikaActionId } from '@devedesiatky/simulation'

export function PolitikaScreen({
  state,
  onSpend,
  onFinish,
}: {
  state: GameState
  onSpend: (actionId: PolitikaActionId) => void
  onFinish: () => void
}) {
  const actions = availablePolitikaActions(state.inGovernment)

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Politika">
      <Text style={styles.eyebrow}>Politika</Text>
      <Text style={styles.title}>{state.inGovernment ? 'Vláda' : 'Opozícia'}</Text>
      <Text style={styles.lede}>Utratíš AP teraz. Kauzy prídu neskôr.</Text>
      <Text style={styles.ap}>AP: {state.actionPoints}</Text>

      <View style={styles.actions} accessibilityLabel="Akcie">
        {actions.map((id) => {
          const def = politikaActions[id]
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              disabled={state.actionPoints <= 0}
              onPress={() => onSpend(id)}
              style={[styles.action, state.actionPoints <= 0 && styles.actionDisabled]}
            >
              <Text style={styles.actionTitle}>{def.labelSk}</Text>
              <Text style={styles.actionBlurb}>{def.blurbSk}</Text>
            </Pressable>
          )
        })}
      </View>

      <Pressable accessibilityRole="button" style={styles.cta} onPress={onFinish}>
        <Text style={styles.ctaLabel}>
          {state.inGovernment ? 'Ďalej: Fond' : 'Hotovo'}
        </Text>
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
    fontSize: 26,
    fontWeight: '800',
  },
  lede: {
    color: '#9a8a7a',
    fontSize: 14,
    lineHeight: 20,
  },
  ap: {
    color: '#c45c26',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  actions: {
    gap: 10,
  },
  action: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 14,
    gap: 4,
    backgroundColor: '#1f1216',
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionTitle: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBlurb: {
    color: '#9a8a7a',
    fontSize: 13,
    lineHeight: 18,
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
    fontSize: 16,
    fontWeight: '700',
  },
})
