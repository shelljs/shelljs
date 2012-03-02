require('../maker');

var assert = require('assert'),
    path = require('path');

silent();

function numLines(str) {
  return typeof str === 'string' ? str.match(/\n/g).length : 0;
}

//
// Valids
//

var _pwd = pwd();
assert.equal(error(), null);
assert.equal(_pwd, path.resolve('.'));

cd('tmp');
var _pwd = pwd();
assert.equal(error(), null);
assert.equal(path.basename(_pwd), 'tmp');

exit(123);
