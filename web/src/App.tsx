import { Centrala } from './ui/Centrala'
import { FnmScreen } from './ui/FnmScreen'
import { SetupParty } from './ui/SetupParty'
import { useGameStore } from './ui/useGameStore'

export default function App() {
  const phase = useGameStore((s) => s.state.phase)
  const turnPhase = useGameStore((s) => s.state.turnPhase)

  if (phase === 'setup') {
    return <SetupParty />
  }
  if (turnPhase === 'peniaze') {
    return <FnmScreen />
  }
  return <Centrala />
}
