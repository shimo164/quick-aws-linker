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

async function genLambdaUrl(info, action) {
  const region = await chrome.storage.local
    .get(['key'])
    .then((result) => result.key);

  const fnName = info.selectionText;

  let targetUrl = '';
  if (action === 'lambda_console') {
    targetUrl = `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${fnName}?tab=code`;
  } else if (action === 'lambda_logs') {
    targetUrl = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logStream:group=%252Faws%252Flambda%252F${fnName}`;
  }
  return targetUrl;
}

function menuAction(info, tab, action) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: genLambdaUrl,
      args: [info, action],
    },
    (injectionResults) => {
      const targetUrl = injectionResults[0].result;
      chrome.tabs.create({ url: targetUrl });
    },
  );
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'lambda-console':
      menuAction(info, tab, 'lambda_console');
      break;
    case 'lambda-logs':
      menuAction(info, tab, 'lambda_logs');
      break;
    case 'options':
      chrome.runtime.openOptionsPage();
      break;
    default:
      break;
  }
});
