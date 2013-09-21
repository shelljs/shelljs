var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//

var tmp = shell.tempdir();
assert.equal(shell.error(), null);
assert.equal(fs.existsSync(tmp), true);

shell.exit(123);
