import { Centrala } from './ui/Centrala'
import { FnmScreen } from './ui/FnmScreen'
import { GameShell } from './ui/GameShell'
import { PolitikaScreen } from './ui/PolitikaScreen'
import { SetupParty } from './ui/SetupParty'
import { useGameStore } from './ui/useGameStore'

export default function App() {
  const phase = useGameStore((s) => s.state.phase)
  const turnPhase = useGameStore((s) => s.state.turnPhase)

  if (phase === 'setup') {
    return <SetupParty />
  }

  return (
    <GameShell phase={turnPhase}>
      {turnPhase === 'politika' ? (
        <PolitikaScreen />
      ) : turnPhase === 'peniaze' ? (
        <FnmScreen />
      ) : (
        <Centrala />
      )}
    </GameShell>
  )
}
