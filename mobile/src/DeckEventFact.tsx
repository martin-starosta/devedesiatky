import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  factCards,
  timelineEventsById,
  type EventChoiceId,
  type FactId,
} from '@devedesiatky/content'
import {
  availableDeckEventId,
  deckChoicesForEvent,
  type DeckRunState,
} from '@devedesiatky/simulation/deck'

export function DeckEventPanel({
  state,
  onResolve,
}: {
  state: DeckRunState
  onResolve: (choiceId: EventChoiceId) => void
}) {
  if (!state.activeEventId) return null
  const event = timelineEventsById[state.activeEventId]
  if (!event) return null
  const choices = deckChoicesForEvent(state)

  return (
    <View style={styles.block} accessibilityLabel="Udalosť">
      <Text style={styles.eyebrow}>
        Udalosť · {event.year} Q{event.quarter}
      </Text>
      <Text style={styles.title}>{event.titleSk}</Text>
      <Text style={styles.lede}>{event.bodySk}</Text>
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
  )
}

export function DeckFactPanel({
  state,
  onCollect,
  onDismiss,
}: {
  state: DeckRunState
  onCollect: () => void
  onDismiss: () => void
}) {
  if (!state.pendingFactId) return null
  const fact = factCards[state.pendingFactId]
  if (!fact) return null

  return (
    <View style={styles.block} accessibilityLabel="Fakt">
      <Text style={styles.eyebrow}>Čo sa naozaj stalo</Text>
      <Text style={styles.title}>{fact.titleSk}</Text>
      <Text style={styles.lede}>{fact.bodySk}</Text>
      <Text style={styles.source}>{fact.sourceHook}</Text>
      <Pressable accessibilityRole="button" style={styles.choice} onPress={onCollect}>
        <Text style={styles.choiceLabel}>Uložiť na časovú os</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={[styles.choice, styles.choiceGhost]}
        onPress={onDismiss}
      >
        <Text style={[styles.choiceLabel, styles.ghostLabel]}>Preskočiť</Text>
      </Pressable>
    </View>
  )
}

export function DeckCasovaOs({
  collectedFactIds,
  onClose,
}: {
  collectedFactIds: FactId[]
  onClose: () => void
}) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Časová os">
      <Text style={styles.eyebrow}>Časová os</Text>
      <Text style={styles.title}>Čo si otvoril</Text>
      <Text style={styles.lede}>
        {collectedFactIds.length === 0
          ? 'Zatiaľ žiadne faktové kartičky.'
          : `${collectedFactIds.length} kartičiek z behu.`}
      </Text>
      {collectedFactIds.map((id) => {
        const fact = factCards[id]
        if (!fact) return null
        return (
          <View key={id} style={styles.item}>
            <Text style={styles.itemTitle}>{fact.titleSk}</Text>
            <Text style={styles.itemBody}>{fact.bodySk}</Text>
          </View>
        )
      })}
      <Pressable accessibilityRole="button" style={styles.choice} onPress={onClose}>
        <Text style={styles.choiceLabel}>Späť</Text>
      </Pressable>
    </ScrollView>
  )
}

export function canOpenDeckEvent(state: DeckRunState): boolean {
  return state.phase === 'ACQUIRE' && availableDeckEventId(state) != null
}

const styles = StyleSheet.create({
  block: { gap: 10 },
  scroll: { padding: 16, gap: 10, paddingBottom: 40 },
  eyebrow: {
    color: '#c4a484',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: { color: '#f4e6c8', fontSize: 22, fontWeight: '800' },
  lede: { color: '#cbbba8', fontSize: 15, lineHeight: 22 },
  source: { color: '#9a8a7a', fontSize: 12, fontStyle: 'italic' },
  choice: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    backgroundColor: '#1a1012',
    borderRadius: 8,
    padding: 12,
  },
  choiceGhost: { backgroundColor: 'transparent' },
  choiceLabel: { color: '#f4e6c8', fontWeight: '700' },
  ghostLabel: { color: '#9a8a7a' },
  item: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  itemTitle: { color: '#f4e6c8', fontWeight: '800' },
  itemBody: { color: '#bba898', fontSize: 13, lineHeight: 18 },
})
