import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import type { TurnPhase } from '@devedesiatky/simulation'
import type { GameState } from '@devedesiatky/simulation'
import { HudStrip } from './HudStrip'
import { PhaseDock } from './PhaseDock'

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
      <HudStrip state={state} />
      <View style={styles.stage}>{children}</View>
      <PhaseDock phase={phase} />
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  stage: {
    flex: 1,
  },
})
