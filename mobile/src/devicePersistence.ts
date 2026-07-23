import AsyncStorage from '@react-native-async-storage/async-storage'
import { createPersistence } from './persistence'

/** On-device key-value persistence — no accounts, no network. */
export const devicePersistence = createPersistence(AsyncStorage)
