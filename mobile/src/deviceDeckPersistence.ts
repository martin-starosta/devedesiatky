import AsyncStorage from '@react-native-async-storage/async-storage'
import { createDeckPersistence } from './deckPersistence'

/** On-device deck-run persistence — separate key from legacy v2 GameState saves. */
export const deviceDeckPersistence = createDeckPersistence(AsyncStorage)
