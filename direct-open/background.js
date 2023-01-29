chrome.runtime.onInstalled.addListener(function (details) {
  const parent = chrome.contextMenus.create({
    id: 'share',
    title: 'Open Lambda Page',
    contexts: ['all'],
  });

  chrome.contextMenus.create({
    parentId: parent,
    id: 'lambda-console',
    title: 'Lambda Console',
    contexts: ['page'],
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

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'lambda-console':
      menu_action(info, tab, 'lambda_console');
      break;
    case 'lambda-logs':
      menu_action(info, tab, 'lambda_logs');
      break;
    case 'options':
      chrome.runtime.openOptionsPage();
      break;
  }
});

function menu_action(info, tab, action) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: gen_lambda_url,
      args: [info, action],
    },
    (injectionResults) => {
      target_url = injectionResults[0].result;
      chrome.tabs.create({ url: target_url });
    },
  );
}

async function gen_lambda_url(info, action) {
  await chrome.storage.local.get(['key']).then((result) => {
    region = result.key;
  });

  const fn_name = info.selectionText;

  if (action === 'lambda_console') {
    return `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${fn_name}?tab=code`;
  } else if (action === 'lambda_logs') {
    return `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logStream:group=%252Faws%252Flambda%252F${fn_name}`;
  }
}
