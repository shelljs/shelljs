const _processStdoutWrite = process.stdout.write;
const _processStderrWrite = process.stderr.write;
const _stdout = [];
const _stderr = [];

function addToString(str, val) {
  if (Buffer.isBuffer(val)) {
    return str + val.toString();
  }
  return str + val;
}

function joinData(data) {
  return data.reduce(addToString, '');
}

function wrapWrite(target) {
  return function write(val) {
    target.push(val);
    return true;
  };
}

exports.stdout = function stdout() {
  return joinData(_stdout);
};

exports.stderr = function stderr() {
  return joinData(_stderr);
};

exports.init = function init() {
  process.stdout.write = wrapWrite(_stdout);
  process.stderr.write = wrapWrite(_stderr);
};

exports.restore = function restore() {
  process.stdout.write = _processStdoutWrite;
  process.stderr.write = _processStderrWrite;
  _stdout.splice(0);
  _stderr.splice(0);
};
