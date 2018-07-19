/**
 * TODO:
 * 1. 添加，删除时，实时更新
 * 2. loading 完成时要更新
 * 3. 暂时没想到
 */

import { getTab, tabStatus, getOpenTabs } from './utils';

console.log('Background start at %s', +new Date());
let tabCount = 0;
const captureMaps = {};

function setTabsCount(num) {
  chrome.browserAction.setBadgeText({ text: String(num) });
}
getOpenTabs().then(tabs => {
  tabCount = tabs.length;
  console.log('open %s tabs', tabCount);
  setTabsCount(tabCount);
});

async function dealWithGetTabs(params, sender) {
  const tabs = await getOpenTabs();
  console.log('send at %s', +new Date());
  sender({ tabs, captures: captureMaps });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('recive ', message);
  if (message === 'getTabs') {
    dealWithGetTabs(message, sendResponse);
  }
  return true;
});

chrome.tabs.onCreated.addListener((tab) => {
  console.log('onCreated...', tab);
  setTabsCount(++tabCount);
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('onRemoved...', tabId, removeInfo);
  setTabsCount(--tabCount);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('onUpdated...',tabId, changeInfo, tab);
});

// callback 中 只有 tabId， windowId, windowId暂时没啥用，所以只取tabId
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await getTab(tabId);
  console.log('onActivated...', tab);
  if (!tab.url) return;
  if (tab.url.startsWith('chrome://')) return;
  if (tab.status !== tabStatus.COMPLETE) return;
  chrome.tabs.captureVisibleTab(dataUrl => {
    captureMaps[tabId] = dataUrl;
  });
});

chrome.browserAction.onClicked.addListener(function() {
  console.log('on icon click');
  try {
    const index = chrome.extension.getURL('index.html');
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
      for (let i = 0, tab; (tab = tabs[i]); i++) {
        if (tab.url && tab.url === index) {
          chrome.tabs.update(tab.id, { selected: true });
          return;
        }
      }
      console.log('no one create one');
      chrome.tabs.create({ url: index });
    });
  } catch (error) {
    console.log('onClicked error', error);
  }
});
