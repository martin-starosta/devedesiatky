import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createDeckStore } from './src/deckStore'
import { deviceDeckPersistence } from './src/deviceDeckPersistence'
import { DeckQuarterScreen } from './src/DeckQuarterScreen'
import { GameHeader } from './src/GameHeader'

const useDeckStore = createDeckStore({
  persistence: deviceDeckPersistence,
  seed: 1993,
})

export default function App() {
  const [ready, setReady] = useState(false)
  const state = useDeckStore((s) => s.state)
  const hasSave = useDeckStore((s) => s.hasSave)
  const hydrate = useDeckStore((s) => s.hydrate)
  const startRun = useDeckStore((s) => s.startRun)
  const playCard = useDeckStore((s) => s.playCard)
  const endQuarter = useDeckStore((s) => s.endQuarter)
  const shopSkip = useDeckStore((s) => s.shopSkip)
  const openEvent = useDeckStore((s) => s.openEvent)
  const openShop = useDeckStore((s) => s.openShop)
  const openRest = useDeckStore((s) => s.openRest)
  const openInstitution = useDeckStore((s) => s.openInstitution)
  const shopBuy = useDeckStore((s) => s.shopBuy)
  const takePatronage = useDeckStore((s) => s.takePatronage)
  const removeCard = useDeckStore((s) => s.removeCard)
  const upgradeCard = useDeckStore((s) => s.upgradeCard)
  const claimRelic = useDeckStore((s) => s.claimRelic)
  const resolveEvent = useDeckStore((s) => s.resolveEvent)
  const bossPlay = useDeckStore((s) => s.bossPlay)
  const bossEndTurn = useDeckStore((s) => s.bossEndTurn)
  const collectFact = useDeckStore((s) => s.collectFact)
  const dismissFact = useDeckStore((s) => s.dismissFact)
  const newGame = useDeckStore((s) => s.newGame)

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
      Alert.alert('Nová hra?', 'Mazanie uloženého deck behu. Naozaj?', [
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
        <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
          <GameHeader />
          <View style={styles.loading}>
            <ActivityIndicator color="#f4e6c8" />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
        <GameHeader />
        <DeckQuarterScreen
          state={state}
          onStart={(input) => void startRun(input)}
          onPlayCard={(id) => void playCard(id)}
          onEndQuarter={() => void endQuarter()}
          onShopSkip={() => void shopSkip()}
          onOpenEvent={() => void openEvent()}
          onOpenShop={(kind) => void openShop(kind)}
          onOpenRest={() => void openRest()}
          onOpenInstitution={() => void openInstitution()}
          onShopBuy={(id) => void shopBuy(id)}
          onTakePatronage={(id) => void takePatronage(id)}
          onRemoveCard={(id) => void removeCard(id)}
          onUpgradeCard={(id) => void upgradeCard(id)}
          onClaimRelic={(id) => void claimRelic(id)}
          onResolveEvent={(id) => void resolveEvent(id)}
          onBossPlay={(id) => void bossPlay(id)}
          onBossEndTurn={() => void bossEndTurn()}
          onCollectFact={() => void collectFact()}
          onDismissFact={() => void dismissFact()}
          onNewGame={hasSave ? requestNewGame : undefined}
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
