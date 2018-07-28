export const tabStatus = {
  LOADING: 'loading',
  COMPLETE: 'complete'
};

export function sendMessage(params) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(params, response => {
      console.log(response);
      if (response === undefined) return;
      resolve(response);
    });
  });
}

export function getAllWindows(queryParams) {
  return new Promise(resolve => {
    chrome.windows.getAll(queryParams, windows => {
      resolve(windows);
    });
  });
}

export function queryTabs(queryParams = {}) {
  return new Promise(resolve => {
    chrome.tabs.query(queryParams, tabs => {
      resolve(tabs);
    });
  });
}

export function getAllTabs() {
  return queryTabs();
}

export function getCurrentTab() {
  return queryTabs({ active: true, currentWindow: true });
}

export function getOpenTabs() {
  return queryTabs({ currentWindow: true });
}

export function getTab(tabId) {
  return new Promise(resolve => {
    chrome.tabs.get(tabId, tab => {
      resolve(tab);
    });
  });
}

export function updateTab(tabId, updateProperties) {
  console.log('updateTab ... ', tabId, updateProperties);
  return new Promise(resolve => {
    chrome.tabs.update(tabId, updateProperties, tab => {
      resolve(tab);
    });
  });
}

export function reloadTab(tabId) {
  return new Promise(resolve => {
    chrome.tabs.reload(tabId, () => {
      resolve();
    });
  });
}

export function deleteTabs(tabIds) {
  return new Promise(resolve => {
    chrome.tabs.remove(tabIds, () => {
      resolve();
    });
  });
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
