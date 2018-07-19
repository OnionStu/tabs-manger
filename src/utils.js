export const tabStatus = {
  LOADING: 'loading',
  COMPLETE: 'complete'
};

export function sendMessage(params) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(params, response => {
      console.log(response);
      resolve(response);
    });
  });
}


export function getOpenTabs() {
  return new Promise(resolve => {
    chrome.tabs.query({ currentWindow: true }, tabs => {
      resolve(tabs);
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

export function reloadTab(tabId) {
  return new Promise(resolve => {
    chrome.tabs.reload(tabId, () =>{
      resolve()
    });
  })
}

export function deleteTabs(tabIds) {
  return new Promise(resolve => {
    chrome.tabs.remove(tabIds, () =>{
      resolve()
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
