var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

shell.which();
assert.ok(shell.error());

var result = shell.which('asdfasdfasdfasdfasdf'); // what are the odds...
assert.equal(shell.error(), null);
assert.equal(result, null);

//
// Valids
//

var result = shell.which('node');
assert.equal(shell.error(), null);
assert.equal(fs.existsSync(result), true);

shell.exit(123);
