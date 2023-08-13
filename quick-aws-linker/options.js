import { generateTargetUrl } from './scripts/urlProcessor.mjs';
import {
  getRegion,
  isValidRegionName,
  isValidFunctionName,
  isValidXrayTraceId,
} from './scripts/util.mjs';
import { createContextMenuItems } from './background.js';
import {
  saveFunctionHistory,
  loadFunctionHistory,
  deleteOneFunctionHistory,
  clearAllFunctionHistory,
} from './scripts/history.mjs';

const getElem = (id) => document.getElementById(id);

async function loadRegion() {
  const { region } = await chrome.storage.local.get('region');

  const regionInput = document.getElementById('inputRegion');
  const regionLabel = document.getElementById('regionLabel');
  const regionMessage = document.getElementById('regionMessage');

  if (region) {
    regionInput.value = region;
    regionLabel.style.color = 'black';
    regionMessage.textContent = '';
  } else {
    regionLabel.style.color = 'red';
    regionMessage.textContent =
      'Attention: Region is empty, please set and save.';
  }
}

function saveOptions() {
  const region = getElem('inputRegion').value;

  if (!isValidRegionName(region)) {
    document.getElementById('saveMessage').innerHTML =
      'Invalid region format. Please check and try again.';
    return;
  }

  chrome.storage.local.set({ region: region });

  createContextMenuItems(!!region);
  loadRegion();

  getElem('saveMessage').innerHTML = `Saved at ${new Date().toLocaleString()}`;
}

async function accessToService() {
  const region = await getRegion();

  if (!region) {
    alert('Please set region');
    return;
  }

  const input = document.getElementById(this.type).value;
  if (this.action === 'lambda_console' || this.action === 'lambda_logs') {
    if (!isValidFunctionName(input)) {
      alert('Invalid format');
      return;
    }
    saveFunctionHistory(input);
  } else if (this.action == 'xray_trace') {
    if (!isValidXrayTraceId(input)) {
      alert('Invalid format');
      return;
    }
  }

  chrome.tabs.create({ url: generateTargetUrl(this.action, region, input) });
}

document.addEventListener('DOMContentLoaded', loadFunctionHistory);
document.addEventListener('DOMContentLoaded', loadRegion);

['lambdaConsoleButton', 'lambdaLogsButton'].forEach((id) => {
  getElem(id).addEventListener('click', {
    action: id.includes('Console') ? 'lambda_console' : 'lambda_logs',
    type: 'inputLambdaName',
    handleEvent: accessToService,
  });
});

['lambdaConsoleFromHistoryButton', 'lambdaLogsFromHistoryButton'].forEach(
  (id) => {
    getElem(id).addEventListener('click', {
      action: id.includes('Console') ? 'lambda_console' : 'lambda_logs',
      type: 'selectFunction',
      handleEvent: accessToService,
    });
  },
);

getElem('xrayTraceButton').addEventListener('click', {
  action: 'xray_trace',
  type: 'inputTraceId',
  handleEvent: accessToService,
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
