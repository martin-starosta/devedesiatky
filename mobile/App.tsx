import { StatusBar } from 'expo-status-bar'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useGameStore } from './src/gameStore'

export default function App() {
  const year = useGameStore((s) => s.state.year)
  const quarter = useGameStore((s) => s.state.quarter)
  const preferencie = useGameStore((s) => s.state.preferencie)
  const phase = useGameStore((s) => s.state.phase)
  const foundParty = useGameStore((s) => s.foundParty)

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
        <View style={styles.container}>
          <Text style={styles.brand}>Divoké deväťdesiate</Text>
          <Text style={styles.meta}>
            {year} Q{quarter} · {phase}
          </Text>
          <Text style={styles.preferencie} accessibilityLabel="preferencie">
            Preferencie: {preferencie.toFixed(1)} %
          </Text>
          {phase === 'setup' ? (
            <Pressable
              style={styles.cta}
              onPress={() => foundParty({ preset: 'hnutie-machine' })}
              accessibilityRole="button"
            >
              <Text style={styles.ctaLabel}>Založiť stranu</Text>
            </Pressable>
          ) : (
            <Text style={styles.hint}>Engine live — GameState cez shared package.</Text>
          )}
          <StatusBar style="dark" />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1a0f12',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'center',
    gap: 12,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f4e6c8',
    letterSpacing: -0.5,
  },
  meta: {
    fontSize: 16,
    color: '#c4a484',
  },
  preferencie: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f0f0f0',
    marginTop: 8,
  },
  cta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#c45c26',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaLabel: {
    color: '#fff8f0',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: '#9a8a7a',
  },
})
