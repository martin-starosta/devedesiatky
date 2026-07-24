import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createGameStore } from './src/gameStore'
import { devicePersistence } from './src/devicePersistence'
import { SetupParty } from './src/SetupParty'
import { GameShell } from './src/GameShell'
import { Centrala } from './src/Centrala'
import { PolitikaScreen } from './src/PolitikaScreen'
import { FnmScreen } from './src/FnmScreen'
import { EventOverlay, FactOverlay } from './src/EventOverlay'
import {
  VolbyKampan,
  VolbyKoalicia,
  VolbyNoc,
  VolbyNocNozo,
} from './src/Volby94'
import { Snem } from './src/Snem'
import { CasovaOs } from './src/CasovaOs'
import { PhaseStub } from './src/PhaseStub'

const useGameStore = createGameStore({ persistence: devicePersistence })

export default function App() {
  const [ready, setReady] = useState(false)
  const [overlay, setOverlay] = useState<'snem' | 'timeline' | null>(null)
  const phase = useGameStore((s) => s.state.phase)
  const turnPhase = useGameStore((s) => s.state.turnPhase)
  const state = useGameStore((s) => s.state)
  const hasSave = useGameStore((s) => s.hasSave)
  const foundParty = useGameStore((s) => s.foundParty)
  const advanceQuarter = useGameStore((s) => s.advanceQuarter)
  const spendPolitika = useGameStore((s) => s.spendPolitika)
  const finishPolitika = useGameStore((s) => s.finishPolitika)
  const assignFnm = useGameStore((s) => s.assignFnm)
  const finishPeniaze = useGameStore((s) => s.finishPeniaze)
  const resolveEvent = useGameStore((s) => s.resolveEvent)
  const collectFact = useGameStore((s) => s.collectFact)
  const dismissFact = useGameStore((s) => s.dismissFact)
  const campaignSpend = useGameStore((s) => s.campaignSpend)
  const finishCampaign = useGameStore((s) => s.finishCampaign)
  const resolveElectionNight = useGameStore((s) => s.resolveElectionNight)
  const continueAfterNight = useGameStore((s) => s.continueAfterNight)
  const offerCoalition = useGameStore((s) => s.offerCoalition)
  const finishCoalition = useGameStore((s) => s.finishCoalition)
  const skipNocNozov = useGameStore((s) => s.skipNocNozov)
  const assignInstitution = useGameStore((s) => s.assignInstitution)
  const finishNocNozov = useGameStore((s) => s.finishNocNozov)
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

  let stage =
    overlay === 'snem' ? (
      <Snem state={state} onClose={() => setOverlay(null)} />
    ) : overlay === 'timeline' ? (
      <CasovaOs state={state} onClose={() => setOverlay(null)} />
    ) : turnPhase === 'centrala' ? (
      <Centrala
        state={state}
        onAdvanceQuarter={() => void advanceQuarter()}
        onOpenSnem={() => setOverlay('snem')}
        onOpenTimeline={() => setOverlay('timeline')}
        onNewGame={hasSave ? requestNewGame : undefined}
      />
    ) : turnPhase === 'politika' ? (
      <PolitikaScreen
        state={state}
        onSpend={(id) => void spendPolitika(id)}
        onFinish={() => void finishPolitika()}
      />
    ) : turnPhase === 'peniaze' ? (
      <FnmScreen
        state={state}
        onAssign={(companyId, destination) => void assignFnm(companyId, destination)}
        onFinish={() => void finishPeniaze()}
      />
    ) : turnPhase === 'event' ? (
      <EventOverlay
        state={state}
        onResolve={(choiceId) => void resolveEvent(choiceId)}
      />
    ) : turnPhase === 'fact' ? (
      <FactOverlay
        state={state}
        onCollect={() => void collectFact()}
        onDismiss={() => void dismissFact()}
      />
    ) : turnPhase === 'volby-kampan' ? (
      <VolbyKampan
        state={state}
        onSpend={(input) => void campaignSpend(input)}
        onFinish={() => void finishCampaign()}
      />
    ) : turnPhase === 'volby-noc' ? (
      <VolbyNoc
        state={state}
        onResolve={() => void resolveElectionNight()}
        onContinue={() => void continueAfterNight()}
      />
    ) : turnPhase === 'volby-koalicia' ? (
      <VolbyKoalicia
        state={state}
        onOffer={(input) => void offerCoalition(input)}
        onFinish={() => void finishCoalition()}
        onSkip={() => void skipNocNozov()}
      />
    ) : turnPhase === 'volby-noc-nozo' ? (
      <VolbyNocNozo
        state={state}
        onAssign={(input) => void assignInstitution(input)}
        onFinish={() => void finishNocNozov()}
      />
    ) : (
      <PhaseStub phase={turnPhase} />
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
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
