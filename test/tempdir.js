var shell = require('..');
var common = require('../src/common');

var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//

var tmp = shell.tempdir();
assert.equal(shell.error(), null);
assert.equal(common.existsSync(tmp), true);

shell.exit(123);
