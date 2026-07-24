import type { ReactNode } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import type { TurnPhase } from '@devedesiatky/simulation'
import type { GameState } from '@devedesiatky/simulation'
import { HudStrip } from './HudStrip'
import { PhaseDock } from './PhaseDock'

const headerBanner = require('../assets/game-slices/header.png')

export function GameShell({
  state,
  phase,
  children,
}: {
  state: GameState
  phase: TurnPhase
  children: ReactNode
}) {
  return (
    <View style={styles.shell} accessibilityLabel={`Fáza ${phase}`}>
      <Image
        source={headerBanner}
        style={styles.banner}
        resizeMode="cover"
        accessibilityLabel="Divoké deväťdesiate"
      />
      <HudStrip state={state} />
      <View style={styles.stage}>{children}</View>
      <PhaseDock phase={phase} />
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#000',
  },
  banner: {
    width: '100%',
    height: 120,
  },
  stage: {
    flex: 1,
  },
})
