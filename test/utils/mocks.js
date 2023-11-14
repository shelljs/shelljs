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

const stdout = {
  original: process.stdout.write,
  value: [],
  init: function init() {
    this.value = [];
    process.stdout.write = wrapWrite(this.value);
  },
  restore: function restore() {
    process.stdout.write = this.original;
  },
  getValue: function getValue() {
    return joinData(this.value);
  }
};

const stderr = {
  original: process.stderr.write,
  value: [],
  init: function init() {
    this.value = [];
    process.stderr.write = wrapWrite(this.value);
  },
  restore: function restore() {
    process.stderr.write = this.original;
  },
  getValue: function getValue() {
    return joinData(this.value);
  }
};

const exit = {
  original: process.exit,
  value: undefined,
  init: function init() {
    this.value = undefined;
    process.exit = (newCode) => {
      this.value = newCode;
    };
  },
  restore: function restore() {
    process.exit = this.original;
  },
  getValue: function getValue() {
    return this.value;
  }
};

exports.stdout = stdout;
exports.stderr = stderr;
exports.exit = exit;
