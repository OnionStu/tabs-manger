module.exports = function addEntry(entrys) {
  return function modConfig(config, env) {
    const appEntry = config.entry,
      [polyfillsJS] = appEntry,
      entryConfig = {
        app: appEntry
      };
    for (const key in entrys) {
      if ({}.hasOwnProperty.call(entrys, key)) {
        entryConfig[key] = [polyfillsJS, entrys[key]];
      }
    }
    config.entry = entryConfig;
    return config;
  };
};
