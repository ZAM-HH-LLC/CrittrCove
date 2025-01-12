const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv = {}) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddBabelTransformContentToConfig: true
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  }, argv);

  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': 'react-native-web-maps',
    crypto: 'crypto-browserify',
    stream: 'stream-browserify',
    vm: false,
    '@stripe/stripe-react-native': '@stripe/stripe-js',
  };

  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
  };

  config.plugins[0].options.template = './web/index.html';

  return config;
};
