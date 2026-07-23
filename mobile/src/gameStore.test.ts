import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'

describe('mobile game store', () => {
  beforeEach(() => {
    useGameStore.setState({
      state: useGameStore.getInitialState().state,
    })
  })

  it('boots from shared bootstrap GameState', () => {
    const { state } = useGameStore.getState()
    expect(state.phase).toBe('setup')
    expect(state.year).toBe(1993)
    expect(state.quarter).toBe(1)
    expect(state.preferencie).toBe(0)
  })

  it('dispatches through reduce (FOUND_PARTY)', () => {
    useGameStore.getState().foundParty({ preset: 'hnutie-machine' })
    const { state } = useGameStore.getState()
    expect(state.phase).toBe('playing')
    expect(state.preferencie).toBeGreaterThan(0)
    expect(state.presetId).toBe('hnutie-machine')
  })
})
