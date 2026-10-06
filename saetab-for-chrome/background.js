const TARGET_URL = "https://search3958.github.io/newtab/?value=wowin";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url === "chrome://newtab" || changeInfo.url === "chrome://newtab/") {
    chrome.tabs.update(tabId, { url: TARGET_URL });
  }
});