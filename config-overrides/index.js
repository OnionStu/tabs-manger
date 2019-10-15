const path = require('path');
const {
  override,
  fixBabelImports,
  addLessLoader,
  disableEsLint
  // addWebpackPlugin
} = require('customize-cra');

const noHash = require('../lib/no-hash');
const addEntry = require('../lib/add-entry');
const theme = require('../theme');

const extraFunc = () => config => {
  console.log("================");
  console.log(JSON.stringify(config, null, 2));
  console.log("=======ENV=========");
  console.log(process.env);
  console.log("================");
  
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    config = noHash(config, env);
    config = addEntry({ background: path.resolve(__dirname, '../src/background.js') }, true)(config);
    // config.output.
    config.optimization.splitChunks = {
      chunks: 'async'
    }
  }
  console.log(config.output)
  console.log("================");
  console.log(config.plugins)
  console.log("================");
  return config;
};

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  }),
  addLessLoader({ javascriptEnabled: true, modifyVars: theme() }),
  // addDecoratorsLegacy(),
  disableEsLint(),
  // addWebpackPlugin(new MonacoWebpackPlugin({ languages: ['json', 'yaml'] })),
  extraFunc()
);
