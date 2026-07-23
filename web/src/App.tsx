import { useState } from 'react'
import { CasovaOs } from './ui/CasovaOs'
import { Centrala } from './ui/Centrala'
import { EventOverlay, FactOverlay } from './ui/EventOverlay'
import { FnmScreen } from './ui/FnmScreen'
import { GameShell } from './ui/GameShell'
import { PolitikaScreen } from './ui/PolitikaScreen'
import { SetupParty } from './ui/SetupParty'
import { Snem } from './ui/Snem'
import { useGameStore } from './ui/useGameStore'

export default function App() {
  const phase = useGameStore((s) => s.state.phase)
  const turnPhase = useGameStore((s) => s.state.turnPhase)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showSnem, setShowSnem] = useState(false)

  if (phase === 'setup') {
    return <SetupParty />
  }

  let stage = (
    <Centrala
      onOpenTimeline={() => setShowTimeline(true)}
      onOpenSnem={() => setShowSnem(true)}
    />
  )
  if (showSnem) {
    stage = <Snem onClose={() => setShowSnem(false)} />
  } else if (showTimeline) {
    stage = <CasovaOs onClose={() => setShowTimeline(false)} />
  } else if (turnPhase === 'politika') {
    stage = <PolitikaScreen />
  } else if (turnPhase === 'peniaze') {
    stage = <FnmScreen />
  } else if (turnPhase === 'event') {
    stage = <EventOverlay />
  } else if (turnPhase === 'fact') {
    stage = <FactOverlay />
  }

  return <GameShell phase={turnPhase}>{stage}</GameShell>
}
