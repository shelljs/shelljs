var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.config.silent = false;

var root = path.resolve(), trail

// Pushing to valid directories
trail = shell.pushd('resources/pushd').split(' ');
assert.equal(shell.error(), null)
assert.equal(trail.length, 2)
assert.equal(path.relative(root, trail[0]), 'resources/pushd')
assert.equal(trail[1], root)

trail = shell.pushd('a').split(' ')
assert.equal(shell.error(), null)
assert.equal(trail.length, 3)
assert.equal(relative(trail[0]), 'resources/pushd/a')
assert.equal(relative(trail[1]), 'resources/pushd')
assert.equal(trail[2], root)

trail = shell.pushd('../b').split(' ')
assert.equal(shell.error(), null)
assert.equal(trail.length, 4)
assert.equal(relative(trail[0]), 'resources/pushd/b')
assert.equal(relative(trail[1]), 'resources/pushd/a')
assert.equal(relative(trail[2]), 'resources/pushd')
assert.equal(trail[3], root)

trail = shell.pushd('c').split(' ')
assert.equal(shell.error(), null)
assert.equal(trail.length, 5)
assert.equal(relative(trail[0]), 'resources/pushd/b/c')
assert.equal(relative(trail[1]), 'resources/pushd/b')
assert.equal(relative(trail[2]), 'resources/pushd/a')
assert.equal(relative(trail[3]), 'resources/pushd')
assert.equal(trail[4], root)

shell.exit(123)