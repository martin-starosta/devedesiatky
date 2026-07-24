import { Image, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { bannerHeight } from './gameHeaderModel'

const headerBanner = require('../assets/game-slices/header.png')

export function GameHeader() {
  const insets = useSafeAreaInsets()
  return (
    <Image
      source={headerBanner}
      style={[styles.banner, { height: bannerHeight(insets.top) }]}
      resizeMode="cover"
      accessibilityLabel="Divoké deväťdesiate"
    />
  )
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
  },
})
