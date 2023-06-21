import { genLambdaUrlFromSelection } from './scripts/urlProcessor.mjs';
import { saveFunctionHistoryMenuSelect } from './scripts/history.mjs';
import { getRegion, getXrayOption } from './scripts/util.mjs';

let menuCreationPromise = null;

function createContextMenuItems(regionSet = false, xrayOption = false) {
  // Store promise of menu creation in variable
  menuCreationPromise = new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      // Code for creating new context menu items should be inside the callback
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
        if (xrayOption) {
          chrome.contextMenus.create({
            parentId: parent,
            id: 'lambda-trace',
            title: 'X-Ray Trace',
            contexts: ['selection'],
          });
        }
      }

      chrome.contextMenus.create({
        parentId: parent,
        id: 'options',
        title: 'Options',
        contexts: ['all'],
      });

      // Resolve the promise when we're done
      resolve();
    });
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
