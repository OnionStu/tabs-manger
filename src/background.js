console.log('Background start at %s', +new Date());
let tabCount = 0;

function getOpenTabs() {
  return new Promise(resolve => {
    chrome.tabs.query({ currentWindow: true }, tabs => {
      resolve(tabs);
    });
  });
}
function setTabsCount(num) {
  chrome.browserAction.setBadgeText({ text: String(num) });
}
getOpenTabs().then(tabs => {
  tabCount = tabs.length;
  console.log('open %s tabs', tabCount);
  setTabsCount(tabCount);
});

chrome.tabs.onCreated.addListener(() => setTabsCount(++tabCount));
chrome.tabs.onRemoved.addListener(() => setTabsCount(--tabCount));

chrome.browserAction.onClicked.addListener(function() {
  const index = chrome.extension.getURL('index.html');
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (let i = 0, tab; (tab = tabs[i]); i++) {
      if (tab.url && tab.url === index) {
        chrome.tabs.update(tab.id, { selected: true });
        return;
      }
    }
    chrome.tabs.create({ url: index });
  });
});
