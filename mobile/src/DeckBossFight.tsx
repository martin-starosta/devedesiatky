import { Pressable, StyleSheet, Text, View } from 'react-native'
import { bossIntentDefs, lookupCard } from '@devedesiatky/content'
import type { DeckRunState } from '@devedesiatky/simulation/deck'

type Props = {
  state: DeckRunState
  onBossPlay: (instanceId: string) => void
  onBossEndTurn: () => void
}

export function DeckBossFight({ state, onBossPlay, onBossEndTurn }: Props) {
  const boss = state.boss
  if (!boss) {
    return <Text style={styles.section}>Voľby '94 — čaká sa na súpera…</Text>
  }

  if (boss.outcome === 'win') {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>Voľby '94 — víťazstvo</Text>
        <Text style={styles.body}>Zostávate vo vláde. Preferencie držia.</Text>
      </View>
    )
  }
  if (boss.outcome === 'lose') {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>Voľby '94 — prehra</Text>
        <Text style={styles.body}>
          Opozícia. Kauzy sú v nepriateľských rukách
          {state.hostileKauzy ? ' (mute vypnutý).' : '.'}
        </Text>
      </View>
    )
  }

  const intent = bossIntentDefs[boss.telegraph]

  return (
    <View style={styles.panel}>
      <Text style={styles.kicker}>Voľby '94</Text>
      <Text style={styles.title}>
        Kolo {boss.round}/{boss.maxRounds}
      </Text>
      <Text style={styles.stat}>
        Podpora súpera {boss.bossSupport}
        {boss.bossBlock > 0 ? ` · blok ${boss.bossBlock}` : ''}
      </Text>
      <Text style={styles.stat}>
        Váš blok {boss.playerBlock} · Preferencie {state.resources.preferencie.toFixed(1)}%
      </Text>
      <Text style={styles.telegraph}>Ďalší ťah: {intent.labelSk}</Text>

      <Text style={styles.section}>Ruka</Text>
      {state.hand.map((card) => {
        const def = lookupCard(card.cardId)
        return (
          <Pressable
            key={card.instanceId}
            accessibilityRole="button"
            style={styles.card}
            onPress={() => onBossPlay(card.instanceId)}
          >
            <Text style={styles.cardTitle}>{def?.titleSk ?? card.cardId}</Text>
            <Text style={styles.cardMeta}>
              {def?.energyCost ?? '?'}⚡ · {def?.blurbSk ?? ''}
            </Text>
          </Pressable>
        )
      })}

      <Pressable accessibilityRole="button" style={styles.primary} onPress={onBossEndTurn}>
        <Text style={styles.primaryLabel}>Koniec kola</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { gap: 10 },
  kicker: {
    color: '#c45c26',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: { color: '#f4e6c8', fontSize: 22, fontWeight: '800' },
  body: { color: '#c8b8a8', fontSize: 14, lineHeight: 20 },
  section: {
    color: '#9a8a7a',
    fontWeight: '700',
    marginTop: 8,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  stat: { color: '#e8e2d6', fontSize: 14, fontWeight: '600' },
  telegraph: {
    color: '#f0c27a',
    fontSize: 15,
    fontWeight: '700',
    marginVertical: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    backgroundColor: '#1a1012',
    padding: 12,
    gap: 4,
  },
  cardTitle: { color: '#f4e6c8', fontWeight: '700', fontSize: 15 },
  cardMeta: { color: '#9a8a7a', fontSize: 12 },
  primary: {
    marginTop: 8,
    backgroundColor: '#c45c26',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryLabel: { color: '#0a0608', fontWeight: '800', fontSize: 15 },
})
