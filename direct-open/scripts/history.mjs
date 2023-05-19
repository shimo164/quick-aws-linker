import { swap } from './util.mjs';

async function saveFunctionHistoryMenuSelect(fnName) {
  const { fnNames: savedFnNames = [] } = await chrome.storage.local.get(
    'fnNames',
  );

  const index = savedFnNames.findIndex((el) => el === fnName);

  const newFnNames =
    index !== -1 ? swap(savedFnNames, 0, index) : [fnName, ...savedFnNames];

  chrome.storage.local.set({ fnNames: newFnNames });
}

export { saveFunctionHistoryMenuSelect };
