import { generateTargetUrl } from './scripts/urlProcessor.mjs';
import { getRegion } from './scripts/util.mjs';
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
  const value = document.getElementById('inputRegion').value;

  // Validate region using regex pattern
  if (!regionPattern.test(value)) {
    document.getElementById('saveMessage').innerHTML =
      'Invalid region format. Please check and try again.';
    return;
  }

  chrome.storage.local.set({ region: value });

  const xrayOption = document.getElementById('xrayOption').checked;
  chrome.storage.local.set({ xrayOption });

  document.getElementById(
    'saveMessage',
  ).innerHTML = `Saved at ${new Date().toLocaleString()}`;

  loadRegion();
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
