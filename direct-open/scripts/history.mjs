import { swap } from './util.mjs';

function saveFunctionHistoryMenuSelect(fnName) {
  // On menu selection, save without load history
  chrome.storage.local.get('fnNames', (items) => {
    const savedFnNames = items.fnNames;

    // fnNames is empty or undefined
    if (savedFnNames === '' || savedFnNames === undefined) {
      chrome.storage.local.set({ fnNames: [fnName] });
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
  });
}

export { saveFunctionHistoryMenuSelect };
