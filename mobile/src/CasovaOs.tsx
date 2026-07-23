import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { factCards } from '@devedesiatky/content'
import type { GameState } from '@devedesiatky/simulation'

export function CasovaOs({ state, onClose }: { state: GameState; onClose: () => void }) {
  const collected = state.collectedFactIds

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Časová os">
      <Text style={styles.eyebrow}>Časová os</Text>
      <Text style={styles.title}>Čo si otvoril</Text>
      <Text style={styles.lede}>
        {collected.length === 0
          ? 'Zatiaľ žiadne faktové kartičky. Po udalostiach ich môžeš uložiť.'
          : `${collected.length} kartičiek z behu.`}
      </Text>

      {collected.map((id) => {
        const fact = factCards[id]
        if (!fact) return null
        return (
          <View key={id} style={styles.item}>
            <Text style={styles.itemTitle}>{fact.titleSk}</Text>
            <Text style={styles.itemBody}>{fact.bodySk}</Text>
          </View>
        )
      })}

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
    marginBottom: 4,
  },
  item: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 14,
    gap: 6,
    backgroundColor: '#1f1216',
  },
  itemTitle: {
    color: '#f0f0f0',
    fontWeight: '700',
    fontSize: 15,
  },
  itemBody: {
    color: '#c4a484',
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
    fontSize: 15,
    fontWeight: '700',
  },
})
