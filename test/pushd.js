var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.config.silent = true;

var root = path.resolve(), trail;

// Valid
trail = shell.pushd('resources/pushd');
assert.equal(shell.error(), null);
assert.equal(trail.length, 2);
assert.equal(path.relative(root, trail[0]), 'resources/pushd');
assert.equal(trail[1], root);
assert.equal(process.cwd(), trail[0]);

trail = shell.pushd('a');
assert.equal(shell.error(), null);
assert.equal(trail.length, 3);
assert.equal(path.relative(root, trail[0]), 'resources/pushd/a');
assert.equal(path.relative(root, trail[1]), 'resources/pushd');
assert.equal(trail[2], root);
assert.equal(process.cwd(), trail[0]);

trail = shell.pushd('../b');
assert.equal(shell.error(), null);
assert.equal(trail.length, 4);
assert.equal(path.relative(root, trail[0]), 'resources/pushd/b');
assert.equal(path.relative(root, trail[1]), 'resources/pushd/a');
assert.equal(path.relative(root, trail[2]), 'resources/pushd');
assert.equal(trail[3], root);
assert.equal(process.cwd(), trail[0]);

trail = shell.pushd('c');
assert.equal(shell.error(), null);
assert.equal(trail.length, 5);
assert.equal(path.relative(root, trail[0]), 'resources/pushd/b/c');
assert.equal(path.relative(root, trail[1]), 'resources/pushd/b');
assert.equal(path.relative(root, trail[2]), 'resources/pushd/a');
assert.equal(path.relative(root, trail[3]), 'resources/pushd');
assert.equal(trail[4], root);
assert.equal(process.cwd(), trail[0]);

shell.exit(123);