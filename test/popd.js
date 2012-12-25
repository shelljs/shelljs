var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.config.silent = false;

var root = path.resolve(), trail

// Pushing to valid directories
shell.pushd('resources/pushd');
trail = shell.popd().split(' ');
assert.equal(shell.error(), null);
assert.equal(trail.length, 1);
assert.equal(trail[0], root);

shell.pushd('resources/pushd');
shell.pushd('a');
trail = shell.popd().split(' ');
assert.equal(shell.error(), null);
assert.equal(trail.length, 2);
assert.equal(trail[0], path.resolve(root, 'resources/pushd'));
assert.equal(trail[1], root);

shell.pushd('b');
trail = shell.popd().split(' ');
assert.equal(shell.error(), null);
assert.equal(trail.length, 2);
assert.equal(trail[0], path.resolve(root, 'resources/pushd'));
assert.equal(trail[1], root);

shell.pushd('b');
shell.pushd('c');
trail = shell.popd().split(' ');
assert.equal(shell.error(), null);
assert.equal(trail.length, 3);
assert.equal(trail[0], path.resolve(root, 'resources/pushd/b'));
assert.equal(trail[1], path.resolve(root, 'resources/pushd'));
assert.equal(trail[2], root);

trail = shell.popd().split(' ');
assert.equal(shell.error(), null);
assert.equal(trail.length, 2);
assert.equal(trail[0], path.resolve(root, 'resources/pushd'));
assert.equal(trail[1], root);

shell.exit(123)