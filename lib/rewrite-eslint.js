const path = require('path');
const { getLoader, loaderNameMatches } = require('react-app-rewired');

function createRewriteEslint(eslintConfig = {}) {
  return function(config, env) {
    const esLoader = getLoader(config.module.rules, rule => loaderNameMatches(rule, 'eslint-loader'));
    esLoader.options.baseConfig = Object.assign({},esLoader.options.baseConfig,eslintConfig)
    return config;
  };
}

const rewireESLint = createRewriteEslint();

rewireESLint.withLoaderOptions = createRewriteEslint;

module.exports = rewireESLint;
