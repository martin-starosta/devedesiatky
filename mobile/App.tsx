import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createGameStore } from './src/gameStore'
import { devicePersistence } from './src/devicePersistence'

const useGameStore = createGameStore({ persistence: devicePersistence })

export default function App() {
  const [ready, setReady] = useState(false)
  const year = useGameStore((s) => s.state.year)
  const quarter = useGameStore((s) => s.state.quarter)
  const preferencie = useGameStore((s) => s.state.preferencie)
  const phase = useGameStore((s) => s.state.phase)
  const hasSave = useGameStore((s) => s.hasSave)
  const foundParty = useGameStore((s) => s.foundParty)
  const newGame = useGameStore((s) => s.newGame)
  const hydrate = useGameStore((s) => s.hydrate)

  useEffect(() => {
    void hydrate().finally(() => setReady(true))
  }, [hydrate])

  function requestNewGame() {
    const result = newGame({ confirmed: false })
    if (result instanceof Promise) {
      void result
      return
    }
    if (result.needsConfirmation) {
      Alert.alert('Nová hra?', 'Mazanie uloženej kampane. Naozaj začať odznova?', [
        { text: 'Zrušiť', style: 'cancel' },
        {
          text: 'Nová hra',
          style: 'destructive',
          onPress: () => {
            void newGame({ confirmed: true })
          },
        },
      ])
    }
  }

  if (!ready) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
            <ActivityIndicator color="#f4e6c8" />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
        <View style={styles.container}>
          <Text style={styles.brand}>Divoké deväťdesiate</Text>
          <Text style={styles.meta}>
            {year} Q{quarter} · {phase}
            {hasSave ? ' · uložené' : ''}
          </Text>
          <Text style={styles.preferencie} accessibilityLabel="preferencie">
            Preferencie: {preferencie.toFixed(1)} %
          </Text>
          {phase === 'setup' ? (
            <Pressable
              style={styles.cta}
              onPress={() => void foundParty({ preset: 'hnutie-machine' })}
              accessibilityRole="button"
            >
              <Text style={styles.ctaLabel}>Založiť stranu</Text>
            </Pressable>
          ) : (
            <Text style={styles.hint}>Engine live — GameState cez shared package.</Text>
          )}
          {hasSave ? (
            <Pressable style={styles.secondary} onPress={requestNewGame} accessibilityRole="button">
              <Text style={styles.secondaryLabel}>Nová hra</Text>
            </Pressable>
          ) : null}
          <StatusBar style="light" />
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
  secondary: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryLabel: {
    color: '#c4a484',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: '#9a8a7a',
  },
})
