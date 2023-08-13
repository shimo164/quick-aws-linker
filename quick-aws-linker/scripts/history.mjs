import { swap, getRegion, removeOptions, spliceArray } from './util.mjs';

export async function saveFunctionHistoryMenuSelect(fnName) {
  const { fnNames: savedFnNames = [] } = await chrome.storage.local.get(
    'fnNames',
  );

  const index = savedFnNames.findIndex((el) => el === fnName);

  // If the name is already in the array, move to the begging.
  const newFnNames =
    index !== -1 ? swap(savedFnNames, 0, index) : [fnName, ...savedFnNames];

  // Cap the length of history to 50
  if (newFnNames.length > 50) {
    newFnNames.pop(); // Remove the oldest item
  }

  chrome.storage.local.set({ fnNames: newFnNames });
}

export function loadFunctionHistory() {
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

export function saveFunctionHistory(fnName) {
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

export function deleteOneFunctionHistory() {
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

export function clearAllFunctionHistory() {
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
