import { Centrala } from './ui/Centrala'
import { SetupParty } from './ui/SetupParty'
import { useGameStore } from './ui/useGameStore'

export default function App() {
  const phase = useGameStore((s) => s.state.phase)
  return phase === 'setup' ? <SetupParty /> : <Centrala />
}
