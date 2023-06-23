const { getDefaultConfig } = require("metro-config");
const { resolver: defaultResolver } = getDefaultConfig.getDefaultValues();
module.exports = {
  resolver: {
    extraNodeModules: require("expo-crypto-polyfills"),
    sourceExts: [...defaultResolver.sourceExts, "cjs", "jsx", 'js', 'ts', 'tsx'],
  }
}