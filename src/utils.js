export const tabStatus = {
  LOADING: 'loading',
  COMPLETE: 'complete'
};

export function resizeImg(imgData, { width, height }) {
  const canvas = document.createElement('canvas');
  const canvasContext = canvas.getContext('2d');
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;
      if (width && !height) {
        const scaleRate = imgWidth / width;
        height = imgHeight / scaleRate;
      }
      if (height && !width) {
        const scaleRate = imgWidth / width;
        height = imgHeight / scaleRate;
      }
      canvas.width = width;
      canvas.height = height;
      canvasContext.drawImage(img, 0, 0, imgWidth, imgHeight, 0, 0, width, height);
      resolve(canvas.toDataURL());
    };
    img.src = imgData;
  });
}

export function isOnlyWeb() {
  return !chrome.tabs;
}

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
