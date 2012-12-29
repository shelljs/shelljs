var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.config.silent = true;

function record(test, assert) {
    var oldSilent = shell.config.silent;
    shell.config.silent = false;

    var _outWrite = process.stdout.write,
        _errWrite = process.stderr.write,
        _stdout   = '',
        _stderr   = '';

    process.stdout.write = function(data) {
        _stdout += data;
    };

    process.stderr.write = function(data) {
        _stderr += data
    };

    test();
    process.stdout.write = _outWrite;
    process.stderr.write = _errWrite;
    shell.config.silent = oldSilent;
    assert(_stdout, _stderr);
}

var root = path.resolve();

shell.pushd('resources/pushd');
shell.pushd('a');

var trail = [
  path.resolve(root, 'resources/pushd/a'),
  path.resolve(root, 'resources/pushd'),
  root
];

// One line listing
record(function() {
  assert.deepEqual(shell.dirs(), trail);
}, function(stdout, stderr) {
  assert(!stderr);
  assert.equal(stdout, shell.dirs().join(' ') + '\n');
});

// Multi line listing
record(function() {
  assert.deepEqual(shell.dirs('-p'), trail);
}, function(stdout, stderr) {
  assert(!stderr);
  assert.equal(stdout, shell.dirs().join('\n') + '\n');
});

// Verbose listing
record(function() {
  assert.deepEqual(shell.dirs('-v'), trail);
}, function(stdout, stderr) {
  assert(!stderr);

  var format = function(dir, index) {
    return ' ' + index + ' ' + dir;
  };

  assert.equal(stdout, shell.dirs().map(format).join('\n') + '\n');
});

// Single items
assert.equal(shell.dirs('+0'), trail[0]);
assert.equal(shell.dirs('+1'), trail[1]);
assert.equal(shell.dirs('+2'), trail[2]);
assert.equal(shell.dirs('-0'), trail[2]);
assert.equal(shell.dirs('-1'), trail[1]);
assert.equal(shell.dirs('-2'), trail[0]);

// Clearing items
assert.deepEqual(shell.dirs('-c'), []);
assert(!shell.error());

shell.exit(123);