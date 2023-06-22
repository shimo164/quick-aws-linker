import { genLambdaUrlFromSelection } from './scripts/urlProcessor.mjs';
import { saveFunctionHistoryMenuSelect } from './scripts/history.mjs';
import { getRegion, getXrayOption } from './scripts/util.mjs';

let menuCreationPromise = null;

let menuCreated = false; // flag variable

function createContextMenuItems(regionSet = false, xrayOption = false) {
  // Check if menu is already created
  if (menuCreated) {
    return;
  }

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'share',
      title: 'Open Lambda Page',
      contexts: ['all'],
    });

    if (regionSet) {
      ['Lambda Console', 'Lambda Logs'].forEach((title, i) => {
        const id = `lambda-${i === 0 ? 'console' : 'logs'}`;
        chrome.contextMenus.create({
          parentId: 'share',
          id,
          title: title,
          contexts: ['selection'],
        });
      });

      if (xrayOption) {
        chrome.contextMenus.create({
          parentId: 'share',
          id: 'lambda-trace',
          title: 'X-Ray Trace',
          contexts: ['selection'],
        });
      }
    }

    chrome.contextMenus.create({
      parentId: 'share',
      id: 'options',
      title: 'Options',
      contexts: ['all'],
    });

    // Set flag to true
    menuCreated = true;
  });
}

async function initialize() {
  const region = await getRegion();
  const xrayOption = await getXrayOption();
  // Wait for any previous menu creation to finish
  if (menuCreationPromise) await menuCreationPromise;
  createContextMenuItems(!!region, xrayOption);
}

chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (changes.region || changes.xrayOption) {
    // Wait for any previous menu creation to finish
    if (menuCreationPromise) await menuCreationPromise;
    const region = await getRegion();
    const xrayOption = await getXrayOption();
    createContextMenuItems(!!region, xrayOption);
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
  'lambda-trace': async (info, tab) =>
    await menuAction(info, tab, 'xray_trace'),
  options: () => chrome.runtime.openOptionsPage(),
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const action = menuItemActions[info.menuItemId];
  if (action) await action(info, tab);
});
