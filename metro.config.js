// Metro bundler config — required for Expo to correctly resolve packages
// including @expo/vector-icons and other Expo-managed modules
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
