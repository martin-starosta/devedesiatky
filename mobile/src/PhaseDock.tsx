import { StyleSheet, Text, View } from 'react-native'
import type { TurnPhase } from '@devedesiatky/simulation'
import { phaseDockActiveId, phaseDockSteps } from './shellModel'

export function PhaseDock({ phase }: { phase: TurnPhase }) {
  const activeId = phaseDockActiveId(phase)

  return (
    <View style={styles.dock} accessibilityLabel="Fáza ťahu" accessibilityRole="summary">
      {phaseDockSteps.map((step) => {
        const active = step.id === activeId
        return (
          <View
            key={step.id}
            style={[styles.step, active && styles.stepActive]}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{step.label}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#3a2a28',
    backgroundColor: '#140c0e',
  },
  step: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  stepActive: {
    borderBottomColor: '#c45c26',
  },
  stepLabel: {
    color: '#6a5a50',
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabelActive: {
    color: '#f4e6c8',
  },
})
