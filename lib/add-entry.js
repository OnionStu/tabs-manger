const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * 添加入口
 * @param {*} entrys 入口文件
 * @param {Boolean} addOutput 是否添加输出HTML
 */
module.exports = function addEntry(entrys, addOutput) {
  return function modConfig(config, env) {
    const appEntry = config.entry,
      [polyfillsJS] = appEntry,
      entryConfig = {
        index: appEntry
      };
    for (const key in entrys) {
      if ({}.hasOwnProperty.call(entrys, key)) {
        // entryConfig[key] = [polyfillsJS, entrys[key]];
        entryConfig[key] = entrys[key];
      }
    }
    if (addOutput) {
      if (config.plugins) {
        let pluginOptions;
        config.plugins = config.plugins.filter(plugin => {
          const flag = plugin.constructor.name !== HtmlWebpackPlugin.name;
          !flag && (pluginOptions = plugin.options);
          return flag;
        });
        if (!pluginOptions) {
          // 此处应设默认值~目前没有~
        }
        for (const key in entryConfig) {
          if ({}.hasOwnProperty.call(entryConfig, key)) {
            config.plugins.push(
              new HtmlWebpackPlugin(Object.assign({}, pluginOptions, { filename: `${key}.html`, chunks: [key] }))
            );
          }
        }
      }
    }

    config.entry = entryConfig;
    return config;
  };
};
