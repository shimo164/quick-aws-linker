function swap(array, i1, i2) {
  [array[i1], array[i2]] = [array[i2], array[i1]];
  return array;
}

function removeOptions(selectElement) {
  let i;
  const L = selectElement.options.length - 1;
  for (i = L; i >= 0; i -= 1) {
    selectElement.remove(i);
  }
}

function spliceArray(array, index) {
  if (array.length !== 0 && index !== -1) {
    array.splice(index, 1);
  }
}

export { swap, removeOptions, spliceArray };
