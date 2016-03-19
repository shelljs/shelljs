/* globals cat, config, cp, env, error, exit, mkdir, rm */

require('../global');

var assert = require('assert');
var fs = require('fs');

config.silent = true;

rm('-rf', 'tmp');
mkdir('tmp');

//
// Valids
//

assert.equal(process.env, env);

// cat
var result = cat('resources/cat/file1');
assert.equal(error(), null);
assert.equal(result.code, 0);
assert.equal(result, 'test1\n');

// rm
cp('-f', 'resources/file1', 'tmp/file1');
assert.equal(fs.existsSync('tmp/file1'), true);
result = rm('tmp/file1');
assert.equal(error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/file1'), false);

// String.prototype is modified for global require
'foo'.to('tmp/testfile.txt');
assert.equal('foo', cat('tmp/testfile.txt'));
'bar'.toEnd('tmp/testfile.txt');
assert.equal('foobar', cat('tmp/testfile.txt'));

exit(123);


