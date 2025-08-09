const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle the picker and QR code issues
config.resolver.alias = {
  ...config.resolver.alias,
  './UnimplementedView': require.resolve('react-native/Libraries/Components/UnimplementedViews/UnimplementedView'),
};

// Add support for react-native-qrcode-svg
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config; 