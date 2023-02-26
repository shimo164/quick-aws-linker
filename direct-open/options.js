function SaveRegion() {
  const value = document.getElementById('inputRegion').value;

  chrome.storage.local.set({ region: value }).then(() => {});

  const message1 = document.getElementById('saveRegionMessage1');
  const message2 = document.getElementById('saveRegionMessage2');
  const now = new Date();
  message1.innerHTML = `Value is set to ${value}`;
  message2.innerHTML = now.toLocaleString();
}

function LoadRegion() {
  chrome.storage.local.get('region', (items) => {
    const savedRegion = items.region;
    if (typeof savedRegion !== 'undefined') {
      document.getElementById('inputRegion').value = savedRegion;
    }
  });
}

async function OpenLambda() {
  let targetUrl = '';
  const action = this.action;

  const region = await chrome.storage.local
    .get(['region'])
    .then((result) => result.region);

  const fnName = document.getElementById('inputLambdaName').value;

  if (action === 'lambda_console') {
    targetUrl = `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${fnName}?tab=code`;
  } else if (action === 'lambda_logs') {
    targetUrl = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logStream:group=%252Faws%252Flambda%252F${fnName}`;
  }

  chrome.tabs.create({ url: targetUrl });
}

document.addEventListener('DOMContentLoaded', LoadRegion);

document.getElementById('saveButton').addEventListener('click', SaveRegion);

document.getElementById('lambdaConsoleButton').addEventListener('click', {
  action: 'lambda_console',
  handleEvent: OpenLambda,
});

document.getElementById('lambdaLogsButton').addEventListener('click', {
  action: 'lambda_logs',
  handleEvent: OpenLambda,
});
