var shell = require('..');
var common = require('../src/common');

var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

// too few args
assert.throws(function () {
  common.expand();
}, TypeError);

// should be a list
assert.throws(function () {
  common.expand("resources");
}, TypeError);

//
// Valids
//

var result;

// single file, array syntax
result = common.expand(['resources/file1.txt']);
assert.equal(shell.error(), null);
assert.deepEqual(result, ['resources/file1.txt']);

// multiple file, glob syntax, * for file name
result = common.expand(['resources/file*.txt']);
assert.equal(shell.error(), null);
assert.deepEqual(result.sort(), ['resources/file1.txt', 'resources/file2.txt'].sort());

// multiple file, glob syntax, * for directory name
result = common.expand(['*/file*.txt']);
assert.equal(shell.error(), null);
assert.deepEqual(result.sort(), ['resources/file1.txt', 'resources/file2.txt'].sort());

// multiple file, glob syntax, ** for directory name
result = common.expand(['**/file*.js']);
assert.equal(shell.error(), null);
assert.deepEqual(result.sort(), ["resources/file1.js","resources/file2.js","resources/ls/file1.js","resources/ls/file2.js"].sort());

// broken links still expand
result = common.expand(['resources/b*dlink']);
assert.equal(shell.error(), null);
assert.deepEqual(result, ['resources/badlink']);

// common.parseOptions (normal case)
result = common.parseOptions('-Rf', {
  'R': 'recursive',
  'f': 'force',
  'r': 'reverse'
});
assert.ok(result.recursive === true);
assert.ok(result.force === true);
assert.ok(result.reverse === false);

// common.parseOptions (with mutually-negating options)
result = common.parseOptions('-f', {
  'n': 'no_force',
  'f': '!no_force',
  'R': 'recursive'
});
assert.ok(result.recursive === false);
assert.ok(result.no_force === false);
assert.ok(result.force === undefined); // this key shouldn't exist

// common.parseOptions (the last of the conflicting options should hold)
var options = {
  'n': 'no_force',
  'f': '!no_force',
  'R': 'recursive'
};
result = common.parseOptions('-fn', options);
assert.ok(result.recursive === false);
assert.ok(result.no_force === true);
assert.ok(result.force === undefined); // this key shouldn't exist
result = common.parseOptions('-nf', options);
assert.ok(result.recursive === false);
assert.ok(result.no_force === false);
assert.ok(result.force === undefined); // this key shouldn't exist

// common.parseOptions using an object to hold options
result = common.parseOptions({'-v': 'some text here'}, {
  'v': 'value',
  'f': 'force',
  'r': 'reverse'
});
assert.ok(result.value === 'some text here');
assert.ok(result.force === false);
assert.ok(result.reverse === false);

// Some basic tests on the ShellString type
result = shell.ShellString('foo');
assert.strictEqual(result.toString(), 'foo');
assert.equal(result.stdout, 'foo');
assert.ok(typeof result.stderr === 'undefined');
assert.ok(result.to);
assert.ok(result.toEnd);

// Commands that fail will still output error messages to stderr
result = shell.exec(JSON.stringify(process.execPath) + ' -e "require(\'../global\'); ls(\'noexist\'); cd(\'noexist\');"');
assert.equal(result.stdout, '');
assert.equal(result.stderr, 'ls: no such file or directory: noexist\ncd: no such file or directory: noexist\n');

shell.exit(123);


