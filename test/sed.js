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

assert.equal(fs.existsSync('asdfasdf'), false); // sanity check
shell.sed(/asdf/g, 'nada', 'asdfasdf'); // no such file
assert.ok(shell.error());

// if at least one file is missing, this should be an error
shell.cp('-f', 'resources/file1', 'tmp/file1');
assert.equal(fs.existsSync('asdfasdf'), false); // sanity check
assert.equal(fs.existsSync('tmp/file1'), true); // sanity check
var result = shell.sed(/asdf/g, 'nada', 'tmp/file1', 'asdfasdf');
assert.ok(shell.error());
assert.equal(result.stderr, 'sed: no such file or directory: asdfasdf');

//
// Valids
//

shell.cp('-f', 'resources/file1', 'tmp/file1');
var result = shell.sed('test1', 'hello', 'tmp/file1'); // search string
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'hello');

var result = shell.sed(/test1/, 'hello', 'tmp/file1'); // search regex
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'hello');

var result = shell.sed(/test1/, 1234, 'tmp/file1'); // numeric replacement
assert.equal(shell.error(), null);
assert.equal(result.toString(), '1234');

var replaceFun = function (match) {
  return match.toUpperCase() + match;
};
var result = shell.sed(/test1/, replaceFun, 'tmp/file1'); // replacement function
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'TEST1test1');

var result = shell.sed('-i', /test1/, 'hello', 'tmp/file1');
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'hello');
assert.equal(shell.cat('tmp/file1').toString(), 'hello');

// make sure * in regex is not globbed
var result = shell.sed(/alpha*beta/, 'hello', 'resources/grep/file');
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'hello\nhowareyou\nhello\nthis line ends in.js\nlllllllllllllllll.js\n');

// make sure * in string-regex is not globbed
var result = shell.sed('alpha*beta', 'hello', 'resources/grep/file');
assert.ok(!shell.error());
assert.equal(result.toString(), 'hello\nhowareyou\nhello\nthis line ends in.js\nlllllllllllllllll.js\n');

// make sure * in regex is not globbed
var result = shell.sed(/l*\.js/, '', 'resources/grep/file');
assert.ok(!shell.error());
assert.equal(result.toString(), 'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n');

// make sure * in string-regex is not globbed
var result = shell.sed('l*\\.js', '', 'resources/grep/file');
assert.ok(!shell.error());
assert.equal(result.toString(), 'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n');

shell.cp('-f', 'resources/file1', 'tmp/file1');
shell.cp('-f', 'resources/file2', 'tmp/file2');

// multiple file names
var result = shell.sed('test', 'hello', 'tmp/file1', 'tmp/file2');
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'hello1\nhello2');

// array of file names (and try it out with a simple regex)
var result = shell.sed(/t.*st/, 'hello', ['tmp/file1', 'tmp/file2']);
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'hello1\nhello2');

// multiple file names, with in-place-replacement
var result = shell.sed('-i', 'test', 'hello', ['tmp/file1', 'tmp/file2']);
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'hello1\nhello2');
assert.equal(shell.cat('tmp/file1').toString(), 'hello1');
assert.equal(shell.cat('tmp/file2').toString(), 'hello2');

// glob file names, with in-place-replacement
shell.cp('resources/file*.txt', 'tmp/');
assert.equal(shell.cat('tmp/file1.txt').toString(), 'test1\n');
assert.equal(shell.cat('tmp/file2.txt').toString(), 'test2\n');
var result = shell.sed('-i', 'test', 'hello', 'tmp/file*.txt');
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'hello1\n\nhello2\n'); // TODO: fix sed's behavior
assert.equal(shell.cat('tmp/file1.txt').toString(), 'hello1\n');
assert.equal(shell.cat('tmp/file2.txt').toString(), 'hello2\n');

shell.exit(123);
