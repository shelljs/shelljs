var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

shell.sed();
assert.ok(shell.error());

shell.sed(/asdf/g); // too few args
assert.ok(shell.error());

shell.sed(/asdf/g, 'nada'); // too few args
assert.ok(shell.error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
shell.sed(/asdf/g, 'nada', '/asdfasdf'); // no such file
assert.ok(shell.error());

//
// Valids
//

shell.cp('-f', 'resources/file1', 'tmp/file1');
var result = shell.sed('test1', 'hello', 'tmp/file1'); // search string
assert.equal(shell.error(), null);
assert.equal(result, 'hello');

var result = shell.sed(/test1/, 'hello', 'tmp/file1'); // search regex
assert.equal(shell.error(), null);
assert.equal(result, 'hello');

var result = shell.sed(/test1/, 1234, 'tmp/file1'); // numeric replacement
assert.equal(shell.error(), null);
assert.equal(result, '1234');

var replaceFun = function (match) {
	return match.toUpperCase() + match;
};
var result = shell.sed(/test1/, replaceFun, 'tmp/file1'); // replacement function
assert.equal(shell.error(), null);
assert.equal(result, 'TEST1test1');

var result = shell.sed('-i', /test1/, 'hello', 'tmp/file1');
assert.equal(shell.error(), null);
assert.equal(result, 'hello');
assert.equal(shell.cat('tmp/file1'), 'hello');

shell.exit(123);
