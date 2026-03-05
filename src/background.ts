console.log('GitHub Dungeon Crawler Background Worker Running');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});
