/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */

function swap(array, i1, i2) {
  [array[i1], array[i2]] = [array[i2], array[i1]];
  return array;
}

function removeOptions(selectElement) {
  let i;
  const L = selectElement.options.length - 1;
  for (i = L; i >= 0; i -= 1) {
    selectElement.remove(i);
  }
}

function loadRegion() {
  chrome.storage.local.get('region', (items) => {
    const savedRegion = items.region;
    if (typeof savedRegion !== 'undefined') {
      document.getElementById('inputRegion').value = savedRegion;
    }
  });
}

function saveRegion() {
  const value = document.getElementById('inputRegion').value;
  chrome.storage.local.set({ region: value });

  const message1 = document.getElementById('saveRegionMessage1');
  const message2 = document.getElementById('saveRegionMessage2');
  const now = new Date();
  message1.innerHTML = `Value is set to ${value}`;
  message2.innerHTML = now.toLocaleString();
}

function loadFunctionHistory() {
  chrome.storage.local.get('fnNames', (items) => {
    const options = items.fnNames;

    // Clear options before overwrite
    const select = document.getElementById('selectFunction');
    removeOptions(select);

    // Delete '' if exists
    const index = options.indexOf('');
    if (options.length !== 0 && index !== -1) {
      options.splice(index, 1);
    }

    // Set select options
    for (let i = 0; i < options.length; i += 1) {
      const opt = options[i];
      const el = document.createElement('option');
      el.textContent = opt;
      el.value = opt;
      select.appendChild(el);
    }
  });
}

function saveFunctionHistory(fnName) {
  chrome.storage.local.get('fnNames', (items) => {
    const savedFnNames = items.fnNames;

    // fnNames is empty
    if (savedFnNames === '') {
      chrome.storage.local.set({ fnNames: [fnName] });
      loadFunctionHistory();
      return;
    }

    // If fnName is already in the array, swap to index 0
    // if not, add fnName at index = 0
    const index = savedFnNames.findIndex((el) => el === fnName);
    if (index !== -1) {
      chrome.storage.local.set({ fnNames: swap(savedFnNames, 0, index) });
    } else {
      chrome.storage.local.set({ fnNames: [fnName].concat(savedFnNames) });
    }

    loadFunctionHistory();
  });
}

function deleteOneFunctionHistory() {
  if (confirm('Delete Selected History?')) {
    // Delete selected from option
    const select = document.getElementById('selectFunction');
    const index = select.selectedIndex;
    select.remove(index);

    // Delete selected from storage
    chrome.storage.local.get('fnNames', (items) => {
      const savedFnNames = items.fnNames;
      savedFnNames.splice(index, 1);
      chrome.storage.local.set({ fnNames: savedFnNames });
    });
  }
}

function clearAllFunctionHistory() {
  if (confirm('Clear All History?')) {
    chrome.storage.local.set({ fnNames: '' });
    removeOptions(document.getElementById('selectFunction'));
  }
}

function generateTargetUrl(action, region, fnName) {
  let targetUrl = '';

  if (action === 'lambda_console') {
    targetUrl = `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${fnName}?tab=code`;
  } else if (action === 'lambda_logs') {
    targetUrl = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logStream:group=%252Faws%252Flambda%252F${fnName}`;
  }
  return targetUrl;
}

async function openLambda() {
  const region = await chrome.storage.local
    .get(['region'])
    .then((result) => result.region);

  const fnName = document.getElementById(this.type).value;

  chrome.tabs.create({ url: generateTargetUrl(this.action, region, fnName) });

  saveFunctionHistory(fnName);
}

document.addEventListener('DOMContentLoaded', loadFunctionHistory);
document.addEventListener('DOMContentLoaded', loadRegion);

document.getElementById('saveButton').addEventListener('click', saveRegion);

document.getElementById('lambdaConsoleButton').addEventListener('click', {
  action: 'lambda_console',
  type: 'inputLambdaName',
  handleEvent: openLambda,
});
document.getElementById('lambdaLogsButton').addEventListener('click', {
  action: 'lambda_logs',
  type: 'inputLambdaName',
  handleEvent: openLambda,
});

document
  .getElementById('lambdaConsoleFromHistoryButton')
  .addEventListener('click', {
    action: 'lambda_console',
    type: 'selectFunction',
    handleEvent: openLambda,
  });

document
  .getElementById('lambdaLogsFromHistoryButton')
  .addEventListener('click', {
    action: 'lambda_logs',
    type: 'selectFunction',
    handleEvent: openLambda,
  });

document
  .getElementById('deleteOneFunctionNameButton')
  .addEventListener('click', deleteOneFunctionHistory);

document
  .getElementById('clearAllFunctionNameButton')
  .addEventListener('click', clearAllFunctionHistory);
