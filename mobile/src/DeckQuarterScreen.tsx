import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  cards,
  deckArchetypes,
  lookupCard,
  type AnyPlayableCardId,
  type DeckArchetypeId,
  type EventChoiceId,
} from '@devedesiatky/content'
import type { DeckRunState } from '@devedesiatky/simulation'
import { DeckHud } from './DeckHud'
import {
  canOpenDeckEvent,
  DeckCasovaOs,
  DeckEventPanel,
  DeckFactPanel,
} from './DeckEventFact'

const archetype = deckArchetypes['stroj-moci']

type Props = {
  state: DeckRunState
  onStart: (input: { archetypeId: DeckArchetypeId }) => void
  onPlayCard: (instanceId: string) => void
  onEndQuarter: () => void
  onShopSkip: () => void
  onOpenEvent: () => void
  onOpenShop: (kind: 'shop-clean' | 'shop-patronage') => void
  onShopBuy: (cardId: AnyPlayableCardId) => void
  onTakePatronage: (cardId: AnyPlayableCardId) => void
  onResolveEvent: (choiceId: EventChoiceId) => void
  onCollectFact: () => void
  onDismissFact: () => void
  onNewGame?: () => void
}

export function DeckQuarterScreen({
  state,
  onStart,
  onPlayCard,
  onEndQuarter,
  onShopSkip,
  onOpenEvent,
  onOpenShop,
  onShopBuy,
  onTakePatronage,
  onResolveEvent,
  onCollectFact,
  onDismissFact,
  onNewGame,
}: Props) {
  const [showTimeline, setShowTimeline] = useState(false)

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

  if (showTimeline) {
    return (
      <DeckCasovaOs
        collectedFactIds={state.collectedFactIds}
        onClose={() => setShowTimeline(false)}
      />
    )
  }

  return (
    <View style={styles.shell}>
      <DeckHud state={state} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.row}>
          <Text style={styles.meta}>
            {state.year} Q{state.calendarQuarter} · {state.phase}
          </Text>
          <View style={styles.rowActions}>
            <Pressable accessibilityRole="button" onPress={() => setShowTimeline(true)}>
              <Text style={styles.link}>Časová os ({state.collectedFactIds.length})</Text>
            </Pressable>
            {onNewGame ? (
              <Pressable accessibilityRole="button" onPress={onNewGame}>
                <Text style={styles.link}>Nová hra</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {state.phase === 'FACT' ? (
          <DeckFactPanel
            state={state}
            onCollect={onCollectFact}
            onDismiss={onDismissFact}
          />
        ) : null}

        {state.phase === 'PLAY' ? (
          <>
            <Text style={styles.section}>Ruka</Text>
            {state.hand.map((card) => {
              const def = lookupCard(card.cardId) ?? cards.miting
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
          state.acquireNode === 'event' && state.activeEventId ? (
            <DeckEventPanel state={state} onResolve={onResolveEvent} />
          ) : state.acquireNode === 'shop-clean' ||
            state.acquireNode === 'shop-patronage' ? (
            <View style={styles.result}>
              <Text style={styles.section}>
                {state.acquireNode === 'shop-clean'
                  ? 'Verejná súťaž'
                  : 'Sponzor — patronát'}
              </Text>
              <Text style={styles.blurb}>
                {state.acquireNode === 'shop-clean'
                  ? 'Slabšie karty, bez kauzy.'
                  : 'Silné karty lacno — každá kúpa pridá kauzy.'}
              </Text>
              {(state.shopOffers ?? []).map((cardId) => {
                const def = lookupCard(cardId)
                if (!def) return null
                return (
                  <Pressable
                    key={cardId}
                    accessibilityRole="button"
                    style={styles.card}
                    onPress={() =>
                      state.acquireNode === 'shop-clean'
                        ? onShopBuy(cardId)
                        : onTakePatronage(cardId)
                    }
                  >
                    <Text style={styles.cardTitle}>{def.titleSk}</Text>
                    <Text style={styles.cardBlurb}>{def.blurbSk}</Text>
                  </Pressable>
                )
              })}
              <Pressable
                accessibilityRole="button"
                style={styles.secondary}
                onPress={onShopSkip}
              >
                <Text style={styles.secondaryLabel}>Preskočiť obchod</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.result}>
              <Text style={styles.section}>
                {state.lastCleared ? 'Kvóta splnená' : 'Kvóta nesplnená'}
              </Text>
              <Text style={styles.blurb}>
                Skóre {state.lastScore ?? 0} / {state.quota} · kvartál {state.quarter}/6
              </Text>
              <Pressable
                accessibilityRole="button"
                style={styles.secondary}
                onPress={() => onOpenShop('shop-clean')}
              >
                <Text style={styles.secondaryLabel}>Verejná súťaž</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.secondary}
                onPress={() => onOpenShop('shop-patronage')}
              >
                <Text style={styles.secondaryLabel}>Sponzor (kauzy)</Text>
              </Pressable>
              {canOpenDeckEvent(state) ? (
                <Pressable
                  accessibilityRole="button"
                  style={styles.secondary}
                  onPress={onOpenEvent}
                >
                  <Text style={styles.secondaryLabel}>Historická udalosť</Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                style={styles.primary}
                onPress={onShopSkip}
              >
                <Text style={styles.primaryLabel}>
                  {state.quarter >= 6 ? 'Do volieb' : 'Ďalší kvartál'}
                </Text>
              </Pressable>
            </View>
          )
        ) : null}

        {state.phase === 'BOSS' ? (
          <Text style={styles.section}>
            Voľby '94 — boss stub (#35). Kvóta history done.
            {state.bossAdvantage ? ' Boss má výhodu.' : ''}
          </Text>
        ) : null}
        {state.phase === 'TERMINAL' ? (
          <Text style={styles.section}>Beh ukončený.</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rowActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  kicker: {
    color: '#c45c26',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { color: '#f4e6c8', fontSize: 28, fontWeight: '800' },
  blurb: { color: '#cbbba8', fontSize: 15, lineHeight: 22 },
  meta: { color: '#9a8a7a', fontWeight: '700' },
  link: { color: '#c45c26', fontWeight: '700' },
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
  secondary: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#c45c26',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryLabel: { color: '#f4e6c8', fontWeight: '800', fontSize: 15 },
  result: { gap: 8 },
})
