var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.silent();

shell.rm('-rf', 'tmp');
shell.mkdir('tmp')

//
// Invalids
//

var result = shell.find(); // no paths given
assert.ok(shell.error());

//
// Valids
//

shell.cd('resources/find');
var result = shell.find('.');
assert.equal(shell.error(), null);
assert.equal('.hidden' in result, true);
assert.equal('dir1/dir11/a_dir11' in result, true);
assert.equal(Object.keys(result).length, 10);
shell.cd('../..')

var result = shell.find('resources/find');
assert.equal(shell.error(), null);
assert.equal('resources/find/.hidden' in result, true);
assert.equal('resources/find/dir1/dir11/a_dir11' in result, true);
assert.equal(Object.keys(result).length, 10);

shell.exit(123);
