const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for CSS imports
config.resolver.assetExts.push('css');

module.exports = config;