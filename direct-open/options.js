import { generateTargetUrl } from './scripts/urlProcessor.mjs';
import { getRegion } from './scripts/util.mjs';
import { createContextMenuItems } from './background.js';
import {
  saveFunctionHistory,
  loadFunctionHistory,
  deleteOneFunctionHistory,
  clearAllFunctionHistory,
} from './scripts/history.mjs';

const getElem = (id) => document.getElementById(id);

let xrayOptionLocal; // add this variable to hold the local value of the checkbox

async function loadXrayOption() {
  const { xrayOption } = await chrome.storage.local.get('xrayOption');

  xrayOptionLocal = !!xrayOption; // make sure it's always a boolean
  getElem('xrayOption').checked = xrayOptionLocal;
}

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

const regionPattern =
  /^(us(-gov)?|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\d$/;

function saveOptions() {
  const region = getElem('inputRegion').value;
  chrome.storage.local.set({ region: region });

  // Validate region using regex pattern
  if (!regionPattern.test(region)) {
    document.getElementById('saveMessage').innerHTML =
      'Invalid region format. Please check and try again.';
    return;
  }

  chrome.storage.local.set({ region: region });

  const xrayOption = document.getElementById('xrayOption').checked;
  chrome.storage.local.set({ xrayOption });

  createContextMenuItems(!!region, !!xrayOption);

  getElem('saveMessage').innerHTML = `Saved at ${new Date().toLocaleString()}`;
}

async function accessToService() {
  const region = await getRegion();

  if (!region) {
    alert('Please set region');
    return;
  }

  const fnName = document.getElementById(this.type).value;

  chrome.tabs.create({ url: generateTargetUrl(this.action, region, fnName) });

  if (this.action !== 'xray_trace') {
    saveFunctionHistory(fnName);
  }
}

document.addEventListener('DOMContentLoaded', loadFunctionHistory);
document.addEventListener('DOMContentLoaded', loadRegion);
document.addEventListener('DOMContentLoaded', loadXrayOption);

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
