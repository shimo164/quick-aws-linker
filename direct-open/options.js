import { swap, removeOptions, spliceArray } from './scripts/util.mjs';
import { generateTargetUrl } from './scripts/url.mjs';

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
    if (options === '' || options === undefined) {
      return;
    }

    // Clear options before overwrite
    const select = document.getElementById('selectFunction');
    removeOptions(select);

    // Delete '' if exists
    const index = options.indexOf('');
    spliceArray(options, index);

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

    // fnNames is empty or undefined
    if (savedFnNames === '' || savedFnNames === undefined) {
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
      spliceArray(savedFnNames, index);

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
