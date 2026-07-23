const { getDefaultConfig } = require('expo/metro-config')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Transpile shared workspace TypeScript source packages.
config.resolver.unstable_enablePackageExports = true
config.watcher = config.watcher ?? {}
config.watcher.additionalExts = config.watcher.additionalExts ?? ['mjs', 'cjs']

module.exports = config
