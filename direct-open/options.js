import { swap, removeOptions, spliceArray } from './scripts/util.mjs';
import { generateTargetUrl } from './scripts/url.mjs';

const getElem = (id) => document.getElementById(id);

let xrayOptionLocal; // add this variable to hold the local value of the checkbox

async function getRegion() {
  const { region } = await chrome.storage.local.get('region');
  return region;
}

// Add this function to load XrayOption from storage
async function loadXrayOption() {
  const { xrayOption } = await chrome.storage.local.get('xrayOption');
  xrayOptionLocal = !!xrayOption; // make sure it's always a boolean
  getElem('xrayOption').checked = xrayOptionLocal;
}

// Add this function to handle changes to the checkbox
function handleXrayOptionChange() {
  xrayOptionLocal = getElem('xrayOption').checked;
}

// Add this function to save XrayOption to storage
function saveXrayOption() {
  chrome.storage.local.set({ xrayOption: xrayOptionLocal });
}

function loadRegion() {
  chrome.storage.local.get('region', ({ region }) => {
    if (region) {
      getElem('inputRegion').value = region;
    }
  });
}

function saveOptions() {
  saveRegion();
  saveXrayOption();
  getElem('saveMessage').innerHTML = `Saved at ${new Date().toLocaleString()}`;
}

function saveRegion() {
  const value = getElem('inputRegion').value;
  chrome.storage.local.set({ region: value });

  const xrayOption = getElem('xrayOption').checked;
  chrome.storage.local.set({ xrayOption });
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
  getRegion().then((region) => {
    if (!region) {
      alert('Please set region');
      return;
    }
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
  });
}

function clearAllFunctionHistory() {
  getRegion().then((region) => {
    if (!region) {
      alert('Please set region');
      return;
    }
    if (confirm('Clear All History?')) {
      chrome.storage.local.set({ fnNames: '' });
      removeOptions(document.getElementById('selectFunction'));
    }
  });
}

async function openLambda() {
  const region = await getRegion();

  if (!region) {
    alert('Please set region');
    return;
  }

  const fnName = document.getElementById(this.type).value;

  chrome.tabs.create({ url: generateTargetUrl(this.action, region, fnName) });

  saveFunctionHistory(fnName);
}
document.addEventListener('DOMContentLoaded', loadFunctionHistory);
document.addEventListener('DOMContentLoaded', loadRegion);
document.addEventListener('DOMContentLoaded', loadXrayOption);

['lambdaConsoleButton', 'lambdaLogsButton'].forEach((id) => {
  getElem(id).addEventListener('click', {
    action: id.includes('Console') ? 'lambda_console' : 'lambda_logs',
    type: 'inputLambdaName',
    handleEvent: openLambda,
  });
});

['lambdaConsoleFromHistoryButton', 'lambdaLogsFromHistoryButton'].forEach(
  (id) => {
    getElem(id).addEventListener('click', {
      action: id.includes('Console') ? 'lambda_console' : 'lambda_logs',
      type: 'selectFunction',
      handleEvent: openLambda,
    });
  },
);

getElem('xrayTraceButton').addEventListener('click', {
  action: 'xray_trace',
  type: 'inputTraceId',
  handleEvent: openLambda,
});

getElem('deleteOneFunctionNameButton').addEventListener(
  'click',
  deleteOneFunctionHistory,
);
getElem('clearAllFunctionNameButton').addEventListener(
  'click',
  clearAllFunctionHistory,
);

getElem('saveButton').addEventListener('click', saveOptions);

getElem('xrayOption').addEventListener('change', handleXrayOptionChange);
