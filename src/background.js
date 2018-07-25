/**
 * TODO:
 * 6. 用canvas缩小缩略图
 * 7. 快捷方式(好似冇？)
 * 8. 格子 和 列表 切换
 * 9. 撤回刚刚删除的？
 * 10. 多选删除？
 * 11. 搜索 想打开的tab
 * 12. 如果当前页在刷新，如果刷新完成的时候，还在当前，而且冇截图，就截屏个屏
 * 13. 统计偶然不准
 * 14. 统计数应该 只算当前窗口
 * 15. 点图片展开大图
 * 4. 暂时没想到
 *
 * DONE:
 * 1. 添加，删除时，实时更新
 * 2. loading 完成时要更新
 * 3. 点击切换到对应 Tab
 * 5. 点击tab时更新tabs
 */

import { getTab, tabStatus, getOpenTabs, getCurrentTab, sendMessage } from './utils';

console.log('Background start at %s', +new Date());
let tabCount = 0;
const indexURL = chrome.extension.getURL('index.html');
const captureMaps = {};

function setTabsCount(num) {
  chrome.browserAction.setBadgeText({ text: String(num) });
}

function formatTabs(tabs, captures) {
  return tabs.map(tab => {
    captures[tab.id] && (tab.capture = captures[tab.id]);
    return tab;
  });
}

getOpenTabs().then(tabs => {
  tabCount = tabs.length;
  console.log('open %s tabs', tabCount);
  setTabsCount(tabCount);
});

async function dealWithGetTabs(params, sender) {
  const tabs = await getOpenTabs();
  console.log('send at %s', +new Date());
  sender({ tabs: formatTabs(tabs, captureMaps) });
}

chrome.runtime.onMessage.addListener(function({ msg }, sender, sendResponse) {
  console.log('recive ', msg);
  if (msg === 'getTabs') {
    dealWithGetTabs(msg, sendResponse);
  }
  return true;
});

chrome.tabs.onCreated.addListener(tab => {
  console.log('onCreated...', tab);
  setTabsCount(++tabCount);
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  console.log('onRemoved...', tabId, removeInfo);
  setTabsCount(--tabCount);
  sendMessage({ msg: 'deleteTab', tabId });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log('onUpdated...', tabId, changeInfo, tab);
  if (tab.url === indexURL) return;
  const [currentTab] = await getCurrentTab();
  if (currentTab.url !== indexURL) return;
  sendMessage({ msg: 'updateTab', tabId, tab });
});

// callback 中 只有 tabId， windowId, windowId暂时没啥用，所以只取tabId
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await getTab(tabId);
  console.log('onActivated...', tab);
  if (tab.url && tab.status === tabStatus.COMPLETE) {
    // 如果不是 chrome的设置类页面，而且是已完成状态的话就截个屏（截屏）
    if (!tab.url.startsWith('chrome://')) {
      chrome.tabs.captureVisibleTab(dataUrl => {
        captureMaps[tabId] = dataUrl;
      });
    }
    // 如果点击是当前拓展的Tab 那就更新下 tabs的状态
    if (tab.url === indexURL) {
      const tabs = await getOpenTabs();
      sendMessage({ msg: 'updateTabs', tabs: formatTabs(tabs, captureMaps) });
    }
  }
});

chrome.browserAction.onClicked.addListener(function() {
  console.log('on icon click');
  try {
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
      for (let i = 0, tab; (tab = tabs[i]); i++) {
        if (tab.url && tab.url === indexURL) {
          chrome.tabs.update(tab.id, { selected: true });
          return;
        }
      }
      console.log('no one create one');
      chrome.tabs.create({ url: indexURL });
    });
  } catch (error) {
    console.log('onClicked error', error);
  }
});
