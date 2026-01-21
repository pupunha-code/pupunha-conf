module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Compiler plugin for automatic optimization
      ['babel-plugin-react-compiler', {}],
      // Reanimated plugin must be last
      'react-native-reanimated/plugin',
    ],
  };
};
