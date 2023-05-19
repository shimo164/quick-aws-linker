function swap(array, i1, i2) {
  [array[i1], array[i2]] = [array[i2], array[i1]];
  return array;
}

function removeOptions(selectElement) {
  const { length } = selectElement.options;
  for (let i = length - 1; i >= 0; i -= 1) {
    selectElement.remove(i);
  }
}

function spliceArray(array, index) {
  if (index !== -1) {
    array.splice(index, 1);
  }
}

export { swap, removeOptions, spliceArray };
