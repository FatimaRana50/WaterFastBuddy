// Metro bundler config — required for Expo to correctly resolve packages
// including @expo/vector-icons and other Expo-managed modules
const { getDefaultConfig } = require('expo/metro-config');
const os = require('os');

const config = getDefaultConfig(__dirname);

// Performance optimizations
config.maxWorkers = Math.max(1, Math.floor(os.cpus().length / 2));

// Enable caching
config.cacheStores = [
  new (require('metro-cache').FileStore)({
    root: `${__dirname}/.metro-cache`,
  }),
];

// Support .lottie and other binary assets
config.resolver.assetExts.push('lottie');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'lottie'];

module.exports = config;
