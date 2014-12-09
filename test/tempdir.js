var shell = require('..');

var assert = require('assert');
var existsSync = require('../src/existsSync');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//

var tmp = shell.tempdir();
assert.equal(shell.error(), null);
assert.equal(existsSync(tmp), true);

shell.exit(123);
