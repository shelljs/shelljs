var shell = require('..');
var common = require('../src/common');

var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

// Normal strings don't have '.to()' anymore
var str = 'hello world';
assert.ok(typeof str.to === 'undefined');

shell.ShellString('hello world').to();
assert.ok(shell.error());

assert.equal(common.existsSync('/asdfasdf'), false); // sanity check
shell.ShellString('hello world').to('/asdfasdf/file');
assert.ok(shell.error());

//
// Valids
//

var result;

shell.ShellString('hello world').to('tmp/to1').to('tmp/to2');
result = shell.cat('tmp/to1');
assert.equal(shell.error(), null);
assert.equal(result, 'hello world');
result = shell.cat('tmp/to2');
assert.equal(shell.error(), null);
assert.equal(result, 'hello world');

// With a glob
shell.ShellString('goodbye').to('tmp/t*1');
assert.equal(common.existsSync('tmp/t*1'), false, 'globs are not interpreted literally');
result = shell.cat('tmp/to1');
assert.equal(shell.error(), null);
assert.equal(result, 'goodbye');

shell.exit(123);
