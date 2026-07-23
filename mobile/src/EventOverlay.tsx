import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { factCards, timelineEventsById } from '@devedesiatky/content'
import { choicesForEvent, type EventChoiceId, type GameState } from '@devedesiatky/simulation'

export function EventOverlay({
  state,
  onResolve,
}: {
  state: GameState
  onResolve: (choiceId: EventChoiceId) => void
}) {
  if (!state.activeEventId) return null
  const event = timelineEventsById[state.activeEventId]
  if (!event) return null
  const choices = choicesForEvent(state)

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Udalosť">
      <Text style={styles.eyebrow}>
        Udalosť · {event.year} Q{event.quarter}
      </Text>
      <Text style={styles.title}>{event.titleSk}</Text>
      <Text style={styles.lede}>{event.bodySk}</Text>

      <View style={styles.choices} accessibilityLabel="Voľby">
        {choices.map((choice) => (
          <Pressable
            key={choice.id}
            accessibilityRole="button"
            style={styles.choice}
            onPress={() => onResolve(choice.id)}
          >
            <Text style={styles.choiceLabel}>{choice.labelSk}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

export function FactOverlay({
  state,
  onCollect,
  onDismiss,
}: {
  state: GameState
  onCollect: () => void
  onDismiss: () => void
}) {
  if (!state.pendingFactId) return null
  const fact = factCards[state.pendingFactId]
  if (!fact) return null

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Fakt">
      <Text style={styles.eyebrow}>Čo sa naozaj stalo</Text>
      <Text style={styles.title}>{fact.titleSk}</Text>
      <Text style={styles.lede}>{fact.bodySk}</Text>
      <Text style={styles.source}>{fact.sourceHook}</Text>

      <View style={styles.choices}>
        <Pressable accessibilityRole="button" style={styles.choice} onPress={onCollect}>
          <Text style={styles.choiceLabel}>Uložiť na časovú os</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={[styles.choice, styles.choiceGhost]}
          onPress={onDismiss}
        >
          <Text style={[styles.choiceLabel, styles.choiceGhostLabel]}>Preskočiť</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
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
    color: '#e8e2d6',
    fontSize: 15,
    lineHeight: 22,
  },
  source: {
    color: '#9a8a7a',
    fontSize: 13,
    fontStyle: 'italic',
  },
  choices: {
    gap: 8,
    marginTop: 8,
  },
  choice: {
    backgroundColor: '#c45c26',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  choiceGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3a2a28',
  },
  choiceLabel: {
    color: '#fff8f0',
    fontSize: 15,
    fontWeight: '700',
  },
  choiceGhostLabel: {
    color: '#c4a484',
  },
})
