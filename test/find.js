var shell = require('..');

var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

var result = shell.find(); // no paths given
assert.equal(result.code, 1);
assert.ok(shell.error());

//
// Valids
//

// current path
shell.cd('resources/find');
result = shell.find('.');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.indexOf('.hidden') > -1, true);
assert.equal(result.indexOf('dir1/dir11/a_dir11') > -1, true);
assert.equal(result.length, 11);
shell.cd('../..');

// simple path
result = shell.find('resources/find');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.indexOf('resources/find/.hidden') > -1, true);
assert.equal(result.indexOf('resources/find/dir1/dir11/a_dir11') > -1, true);
assert.equal(result.length, 11);

// multiple paths - comma
result = shell.find('resources/find/dir1', 'resources/find/dir2');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.indexOf('resources/find/dir1/dir11/a_dir11') > -1, true);
assert.equal(result.indexOf('resources/find/dir2/a_dir1') > -1, true);
assert.equal(result.length, 6);

// multiple paths - array
result = shell.find(['resources/find/dir1', 'resources/find/dir2']);
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.indexOf('resources/find/dir1/dir11/a_dir11') > -1, true);
assert.equal(result.indexOf('resources/find/dir2/a_dir1') > -1, true);
assert.equal(result.length, 6);

shell.exit(123);
