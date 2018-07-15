const path = require('path');
const { injectBabelPlugin, getLoader, loaderNameMatches } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');
const noHash = require('./lib/no-hash');
const addEntry = require('./lib/add-entry');
const rewireESLint = require('./lib/rewrite-eslint');
const theme = require('./theme')();

module.exports = function override(config, env) {
  console.log(env);
  config = injectBabelPlugin(['import', { libraryName: 'antd', style: true }], config);
  config = rewireLess.withLoaderOptions({ javascriptEnabled: true, modifyVars: theme })(config, env);
  config = rewireESLint.withLoaderOptions({ globals: { chrome: true } })(config, env);
  config = addEntry({ background: path.resolve(__dirname, './src/background.js') })(config, env);
  config = noHash(config, env);
  return config;
};
