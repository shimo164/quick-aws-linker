import { generateUrlWithSelection } from './scripts/urlProcessor.mjs';
import { saveFunctionHistoryMenuSelect } from './scripts/history.mjs';
import {
  getRegion,
  isValidFunctionName,
  isValidXrayTraceId,
  notifyUser,
} from './scripts/util.mjs';

let menuCreationPromise = null;
let menuCreated = false;
let isCreatingMenu = false;

function createContextMenuItems(regionSet = false) {
  if (isCreatingMenu) return;
  isCreatingMenu = true;

  chrome.contextMenus.removeAll(() => {
    menuCreated = false;

    chrome.contextMenus.create({
      id: 'share',
      title: 'QuickAWS Linker',
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
    isCreatingMenu = false;
  });
}

async function initialize() {
  const region = await getRegion();
  // Wait for any previous menu creation to finish
  if (menuCreationPromise) await menuCreationPromise;
  createContextMenuItems(!!region);
}

function handleExtensionLoad(details) {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
  initialize();
}

chrome.runtime.onInstalled.addListener(handleExtensionLoad);
chrome.runtime.onStartup.addListener(handleExtensionLoad);

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
  const selectionText = info.selectionText;

  if (action === 'lambda_console' || action === 'lambda_logs') {
    if (!isValidFunctionName(selectionText)) {
      notifyUser('Error', 'Invalid Lambda function name format');
      return;
    }
    saveFunctionHistoryMenuSelect(selectionText);
  } else if (action == 'xray_trace') {
    if (!isValidXrayTraceId(selectionText)) {
      notifyUser('Error', 'Invalid X-Ray trace ID format');
      return;
    }
  }

  const targetUrl = await generateUrlWithSelection(info, action);

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

let storageChangeDebounceTimer = null;
const DEBOUNCE_DELAY = 300; // 300ms, adjust as needed

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (changes.region) {
    clearTimeout(storageChangeDebounceTimer);

    storageChangeDebounceTimer = setTimeout(async () => {
      const region = await getRegion();
      createContextMenuItems(!!region);
    }, DEBOUNCE_DELAY);
  }
});

export { createContextMenuItems };
