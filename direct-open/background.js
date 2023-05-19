import { genLambdaUrlFromSelection } from './scripts/url.mjs';
import { saveFunctionHistoryMenuSelect } from './scripts/history.mjs';

async function getRegion() {
  const { region } = await chrome.storage.local.get('region');
  return region;
}

function createContextMenuItems(regionSet = false) {
  // Clear the existing menus
  chrome.contextMenus.removeAll(() => {
    const parent = chrome.contextMenus.create({
      id: 'share',
      title: 'Open Lambda Page',
      contexts: ['all'],
    });

    if (regionSet) {
      ['Lambda Console', 'Lambda Logs'].forEach((title, i) => {
        chrome.contextMenus.create({
          parentId: parent,
          id: `lambda-${i === 0 ? 'console' : 'logs'}`,
          title: title,
          contexts: ['selection'],
        });
      });
    }

    chrome.contextMenus.create({
      parentId: parent,
      id: 'options',
      title: 'Options',
      contexts: ['all'],
    });
  });
}

async function initialize() {
  const region = await getRegion();
  createContextMenuItems(!!region);
}

chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.region) {
    createContextMenuItems(true);
  }
});

async function menuAction(info, tab, action) {
  const { targetUrl, fnName } = await genLambdaUrlFromSelection(info, action);
  saveFunctionHistoryMenuSelect(fnName);
  chrome.tabs.create({ url: targetUrl });
}

const menuItemActions = {
  'lambda-console': async (info, tab) =>
    await menuAction(info, tab, 'lambda_console'),
  'lambda-logs': async (info, tab) =>
    await menuAction(info, tab, 'lambda_logs'),
  options: () => chrome.runtime.openOptionsPage(),
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const action = menuItemActions[info.menuItemId];
  if (action) await action(info, tab);
});
