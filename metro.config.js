const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// zustand v5 ships an ESM build using import.meta, which Metro web serves as a
// classic script — resolve CJS entries instead.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
