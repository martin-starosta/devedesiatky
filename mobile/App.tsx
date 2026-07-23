import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createGameStore } from './src/gameStore'
import { devicePersistence } from './src/devicePersistence'
import { SetupParty } from './src/SetupParty'
import { GameShell } from './src/GameShell'
import { Centrala } from './src/Centrala'
import { PhaseStub } from './src/PhaseStub'

const useGameStore = createGameStore({ persistence: devicePersistence })

export default function App() {
  const [ready, setReady] = useState(false)
  const phase = useGameStore((s) => s.state.phase)
  const turnPhase = useGameStore((s) => s.state.turnPhase)
  const state = useGameStore((s) => s.state)
  const hasSave = useGameStore((s) => s.hasSave)
  const foundParty = useGameStore((s) => s.foundParty)
  const advanceQuarter = useGameStore((s) => s.advanceQuarter)
  const finishPolitika = useGameStore((s) => s.finishPolitika)
  const finishPeniaze = useGameStore((s) => s.finishPeniaze)
  const resolveEvent = useGameStore((s) => s.resolveEvent)
  const dismissFact = useGameStore((s) => s.dismissFact)
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
          <View style={styles.loading}>
            <ActivityIndicator color="#f4e6c8" />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  if (phase === 'setup') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
          <SetupParty onFound={(input) => void foundParty(input)} />
          <StatusBar style="light" />
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  const stage =
    turnPhase === 'centrala' ? (
      <Centrala
        state={state}
        onAdvanceQuarter={() => void advanceQuarter()}
        onNewGame={hasSave ? requestNewGame : undefined}
      />
    ) : (
      <PhaseStub
        phase={turnPhase}
        onContinue={
          turnPhase === 'politika'
            ? () => void finishPolitika()
            : turnPhase === 'peniaze'
              ? () => void finishPeniaze()
              : turnPhase === 'fact'
                ? () => void dismissFact()
                : turnPhase === 'event'
                  ? () => void resolveEvent()
                  : undefined
        }
      />
    )

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
        <GameShell state={state} phase={turnPhase}>
          {stage}
        </GameShell>
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1a0f12',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
