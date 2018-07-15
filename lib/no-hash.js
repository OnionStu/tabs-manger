function removeHash(str) {
  return str
    .replace(/\.\[chunkhash:8\]/g, '')
    .replace(/\.\[contenthash:8\]/g, '')
    .replace(/\.\[hash:8\]/g, '');
}

function replaceString(obj) {
  for (const key in obj) {
    if ({}.hasOwnProperty.call(obj, key)) {
      const fieldValue = obj[key],
        objType = typeof fieldValue;
      if (objType === 'string') {
        obj[key] = removeHash(fieldValue);
      } else if (objType === 'object') {
        if ({}.toString.call(fieldValue) === '[object Array]') {
          for (let i = 0, len = fieldValue.length; i < len; i++) {
            obj[key][i] = replaceString(fieldValue[i]);
          }
        } else {
          obj[key] = replaceString(fieldValue);
        }
      }
    }
  }
  return obj;
}

module.exports = function noHash(config, env) {
  if (env !== 'production') return config;
  return replaceString(config);
};
