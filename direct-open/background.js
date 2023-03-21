import { genLambdaUrlFromSelection } from './scripts/url.mjs';
import { saveFunctionHistoryMenuSelect } from './scripts/history.mjs';

chrome.runtime.onInstalled.addListener(() => {
  const parent = chrome.contextMenus.create({
    id: 'share',
    title: 'Open Lambda Page',
    contexts: ['all'],
  });

  chrome.contextMenus.create({
    parentId: parent,
    id: 'lambda-console',
    title: 'Lambda Console',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    parentId: parent,
    id: 'lambda-logs',
    title: 'Lambda Logs',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    parentId: parent,
    id: 'options',
    title: 'Options',
    contexts: ['all'],
  });
});

async function menuAction(info, tab, action) {
  const { targetUrl, fnName } = await genLambdaUrlFromSelection(info, action);
  saveFunctionHistoryMenuSelect(fnName);
  chrome.tabs.create({ url: targetUrl });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case 'lambda-console':
      await menuAction(info, tab, 'lambda_console');
      break;
    case 'lambda-logs':
      await menuAction(info, tab, 'lambda_logs');
      break;
    case 'options':
      chrome.runtime.openOptionsPage();
      break;
    default:
      break;
  }
});
