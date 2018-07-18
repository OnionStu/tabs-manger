export function sendMessage(params) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(params, response => {
      console.log(response);
      resolve(response);
    });
  });
}

export function getTab(tabId) {
  return new Promise(resolve => {
    chrome.tabs.get(tabId, tab => {
      resolve(tab);
    });
  });
}

export function updateTab(tabId, updateProperties) {
  return new Promise(resolve => {
    chrome.tabs.update(tabId, updateProperties, tab =>{
      resolve(tab)
    });
  })
}

// export function sendMessage(params, callback) {
//   console.log(+new Date());

//   chrome.runtime.sendMessage(params, function(response) {
//     console.log('response ', +new Date());
//     console.log(response);
//     callback(response);
//   });
// }

export default sendMessage;
