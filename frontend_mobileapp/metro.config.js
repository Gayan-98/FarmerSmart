// Learn more https://docs.expo.io/guides/customizing-metro

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Enable platform-specific extensions
config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(',').map(ext => ext.trim()), ...config.resolver.sourceExts]
  : [...config.resolver.sourceExts, 'web.tsx', 'web.ts', 'web.jsx', 'web.js'];

// 2. Setup extra module resolving for all platforms
config.resolver.extraNodeModules = {
  // Use empty modules for problematic native components on web
  ...(process.env.EXPO_TARGET === 'web' ? {
    'react-native-maps': path.resolve(__dirname, 'node_modules/react-native-maps/lib/index.web.js'),
  } : {})
};

// 3. Ensure the resolver uses the right fields for platform-specific modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 4. Create a mock for problematic modules on web
if (process.env.EXPO_TARGET === 'web') {
  config.transformer.babelTransformerPath = require.resolve('./metro.transform.js');
}

module.exports = config; 