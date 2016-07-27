var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

// Normal strings don't have '.toEnd()' anymore
var str = 'hello world';
assert.ok(typeof str.toEnd === 'undefined');

shell.ShellString('hello world').toEnd();
assert.ok(shell.error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
assert.ok(shell.error());
//
// Valids
//

var result;
assert.equal(fs.existsSync('tmp/toEnd1'), false); //Check file toEnd() creates does not already exist
assert.equal(fs.existsSync('tmp/toEnd2'), false);
shell.ShellString('hello ').toEnd('tmp/toEnd1');
assert.equal(fs.existsSync('tmp/toEnd1'), true); //Check that file was created
shell.ShellString('world').toEnd('tmp/toEnd1').toEnd('tmp/toEnd2'); //Write some more to the file
result = shell.cat('tmp/toEnd1');
assert.equal(shell.error(), null);
assert.equal(result, 'hello world'); //Check that the result is what we expect
result = shell.cat('tmp/toEnd2');
assert.equal(shell.error(), null);
assert.equal(result, 'world'); //Check that the result is what we expect

// With a glob
shell.ShellString('good').to('tmp/toE*1');
shell.ShellString('bye').toEnd('tmp/toE*1');
assert.equal(fs.existsSync('tmp/toE*1'), false, 'globs are not interpreted literally');
result = shell.cat('tmp/toEnd1');
assert.equal(shell.error(), null);
assert.equal(result, 'goodbye');

shell.exit(123);
