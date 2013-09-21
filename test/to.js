var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

'hello world'.to();
assert.ok(shell.error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
'hello world'.to('/asdfasdf/file');
assert.ok(shell.error());

//
// Valids
//

'hello world'.to('tmp/to1');
var result = shell.cat('tmp/to1');
assert.equal(shell.error(), null);
assert.equal(result, 'hello world');

shell.exit(123);
