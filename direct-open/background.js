import { generateUrlWithSelection } from './scripts/urlProcessor.mjs';
import { saveFunctionHistoryMenuSelect } from './scripts/history.mjs';
import { getRegion } from './scripts/util.mjs';

let menuCreationPromise = null;

let menuCreated = false;

function createContextMenuItems(regionSet = false) {
  // Remove all existing context menus and reset the flag
  chrome.contextMenus.removeAll(() => {
    menuCreated = false;

    chrome.contextMenus.create({
      id: 'share',
      title: 'Open Lambda Page',
      contexts: ['all'],
    });

    if (regionSet) {
      const menuItems = [
        { title: 'Lambda Console', id: 'lambda-console' },
        { title: 'Lambda Logs', id: 'lambda-logs' },
        { title: 'X-Ray Trace', id: 'lambda-trace' },
      ];

      menuItems.forEach((item) => {
        chrome.contextMenus.create({
          parentId: 'share',
          id: item.id,
          title: item.title,
          contexts: ['selection'],
        });
      });
    }

    chrome.contextMenus.create({
      parentId: 'share',
      id: 'options',
      title: 'Options',
      contexts: ['all'],
    });

    menuCreated = true;
  });
}

async function initialize() {
  const region = await getRegion();
  // Wait for any previous menu creation to finish
  if (menuCreationPromise) await menuCreationPromise;
  createContextMenuItems(!!region);
}

chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (changes.region) {
    // Wait for any previous menu creation to finish
    if (menuCreationPromise) await menuCreationPromise;
    const region = await getRegion();
    createContextMenuItems(!!region);
  }
});

async function menuAction(info, tab, action) {
  const { targetUrl, fnName } = await generateUrlWithSelection(info, action);
  if (action !== 'xray_trace') {
    saveFunctionHistoryMenuSelect(fnName);
  }
  chrome.tabs.create({ url: targetUrl });
}

const menuItemActions = {
  'lambda-console': async (info, tab) =>
    await menuAction(info, tab, 'lambda_console'),
  'lambda-logs': async (info, tab) =>
    await menuAction(info, tab, 'lambda_logs'),
  'lambda-trace': async (info, tab) =>
    await menuAction(info, tab, 'xray_trace'),
  options: () => chrome.runtime.openOptionsPage(),
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const action = menuItemActions[info.menuItemId];
  if (action) await action(info, tab);
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

export { createContextMenuItems };
