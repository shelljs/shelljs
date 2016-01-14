function _numLines(str) {
  return typeof str === 'string' ? (str.match(/\n/g)||[]).length+1 : 0;
}

exports.numLines = _numLines;
