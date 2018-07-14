module.exports = function override(config, env) {
  // do stuff with the webpack config...
  console.log(config);
  console.log(env);

  return config;
};
