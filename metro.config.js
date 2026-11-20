const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Treat PDF.js files as static assets, not JavaScript modules.
config.resolver.assetExts = [
  ...new Set([...config.resolver.assetExts, 'txt']),
];

// Ensure TXT files are not treated as source files.
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (extension) => extension !== 'txt'
);

module.exports = config;