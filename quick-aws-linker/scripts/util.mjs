export function swap(array, i1, i2) {
  [array[i1], array[i2]] = [array[i2], array[i1]];
  return array;
}

export function removeOptions(selectElement) {
  const { length } = selectElement.options;
  for (let i = length - 1; i >= 0; i -= 1) {
    selectElement.remove(i);
  }
}

export function spliceArray(array, index) {
  if (index !== -1) {
    array.splice(index, 1);
  }
}

export async function getRegion() {
  const { region } = await chrome.storage.local.get('region');
  return region;
}

export function isValidFunctionName(name) {
  const regex = /^[a-zA-Z0-9-_]{1,64}$/;
  return regex.test(name);
}

export function isValidXrayTraceId(traceId) {
  const regex = /^1-[a-fA-F0-9]{8}-[a-fA-F0-9]{24}$/;
  return regex.test(traceId);
}

export function isValidRegionName(name) {
  const regex =
    /^(us(-gov)?|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\d$/;
  return regex.test(name);
}
