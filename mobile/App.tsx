import { StatusBar } from 'expo-status-bar'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createDeckStore } from './src/deckStore'
import { DeckQuarterScreen } from './src/DeckQuarterScreen'

/**
 * Product path for MVP-A (#27+): deck-run reducer, not v2 Politika/FNM.
 * Legacy v2 shell remains in git history / unused imports cleaned for this entry.
 */
const useDeckStore = createDeckStore({ seed: 1993 })

export default function App() {
  const state = useDeckStore((s) => s.state)
  const startRun = useDeckStore((s) => s.startRun)
  const playCard = useDeckStore((s) => s.playCard)
  const endQuarter = useDeckStore((s) => s.endQuarter)
  const shopSkip = useDeckStore((s) => s.shopSkip)

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
        <DeckQuarterScreen
          state={state}
          onStart={(input) => startRun(input)}
          onPlayCard={playCard}
          onEndQuarter={endQuarter}
          onShopSkip={shopSkip}
        />
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
})
