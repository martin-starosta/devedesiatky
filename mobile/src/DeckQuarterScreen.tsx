import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { cards, deckArchetypes, type DeckArchetypeId } from '@devedesiatky/content'
import type { DeckRunState } from '@devedesiatky/simulation'
import { DeckHud } from './DeckHud'

const archetype = deckArchetypes['stroj-moci']

type Props = {
  state: DeckRunState
  onStart: (input: { archetypeId: DeckArchetypeId }) => void
  onPlayCard: (instanceId: string) => void
  onEndQuarter: () => void
  onShopSkip: () => void
}

export function DeckQuarterScreen({
  state,
  onStart,
  onPlayCard,
  onEndQuarter,
  onShopSkip,
}: Props) {
  if (state.deck.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.setup} accessibilityLabel="Výber archetypu">
        <Text style={styles.kicker}>Act I · 1993</Text>
        <Text style={styles.title}>{archetype.labelSk}</Text>
        <Text style={styles.blurb}>{archetype.blurbSk}</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.primary}
          onPress={() => onStart({ archetypeId: 'stroj-moci' })}
        >
          <Text style={styles.primaryLabel}>Začať kvartál</Text>
        </Pressable>
      </ScrollView>
    )
  }

  return (
    <View style={styles.shell}>
      <DeckHud state={state} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.meta}>
          {state.year} Q{state.calendarQuarter} · {state.phase}
        </Text>
        {state.phase === 'PLAY' ? (
          <>
            <Text style={styles.section}>Ruka</Text>
            {state.hand.map((card) => {
              const def = cards[card.cardId]
              const affordable = state.energy >= def.energyCost
              return (
                <Pressable
                  key={card.instanceId}
                  accessibilityRole="button"
                  disabled={!affordable}
                  onPress={() => onPlayCard(card.instanceId)}
                  style={[styles.card, !affordable ? styles.cardDisabled : null]}
                >
                  <Text style={styles.cardTitle}>
                    {def.titleSk} · {def.energyCost}⚡
                  </Text>
                  <Text style={styles.cardBlurb}>{def.blurbSk}</Text>
                </Pressable>
              )
            })}
            <Pressable
              accessibilityRole="button"
              style={styles.primary}
              onPress={onEndQuarter}
            >
              <Text style={styles.primaryLabel}>Ukončiť kvartál</Text>
            </Pressable>
          </>
        ) : null}
        {state.phase === 'ACQUIRE' ? (
          <View style={styles.result}>
            <Text style={styles.section}>
              {state.lastCleared ? 'Kvóta splnená' : 'Kvóta nesplnená'}
            </Text>
            <Text style={styles.blurb}>Skóre {state.lastScore ?? 0} / {state.quota}</Text>
            <Pressable
              accessibilityRole="button"
              style={styles.primary}
              onPress={onShopSkip}
            >
              <Text style={styles.primaryLabel}>Preskočiť obchod (MVP-A)</Text>
            </Pressable>
          </View>
        ) : null}
        {state.phase === 'TERMINAL' ? (
          <Text style={styles.section}>Kvartál hotový. Ďalší clock príde v #28.</Text>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#000' },
  setup: {
    flexGrow: 1,
    padding: 24,
    gap: 12,
    justifyContent: 'center',
    backgroundColor: '#0a0608',
  },
  body: { padding: 16, gap: 10, paddingBottom: 40 },
  kicker: {
    color: '#c45c26',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { color: '#f4e6c8', fontSize: 28, fontWeight: '800' },
  blurb: { color: '#cbbba8', fontSize: 15, lineHeight: 22 },
  meta: { color: '#9a8a7a', fontWeight: '700' },
  section: { color: '#f4e6c8', fontSize: 18, fontWeight: '800', marginTop: 8 },
  card: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    backgroundColor: '#1a1012',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  cardDisabled: { opacity: 0.45 },
  cardTitle: { color: '#f4e6c8', fontWeight: '800', fontSize: 16 },
  cardBlurb: { color: '#bba898', fontSize: 13 },
  primary: {
    marginTop: 12,
    backgroundColor: '#c45c26',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryLabel: { color: '#140c0e', fontWeight: '800', fontSize: 16 },
  result: { gap: 8 },
})
