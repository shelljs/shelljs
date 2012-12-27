var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.config.silent = true;

var root = path.resolve(), trail;

// Valid
shell.pushd('resources/pushd');
trail = shell.popd();
assert.equal(shell.error(), null);
assert.equal(trail.length, 1);
assert.equal(trail[0], root);
assert.equal(process.cwd(), trail[0]);

shell.pushd('resources/pushd');
shell.pushd('a');
trail = shell.popd();
assert.equal(shell.error(), null);
assert.equal(trail.length, 2);
assert.equal(trail[0], path.resolve(root, 'resources/pushd'));
assert.equal(trail[1], root);
assert.equal(process.cwd(), trail[0]);

shell.pushd('b');
trail = shell.popd();
assert.equal(shell.error(), null);
assert.equal(trail.length, 2);
assert.equal(trail[0], path.resolve(root, 'resources/pushd'));
assert.equal(trail[1], root);
assert.equal(process.cwd(), trail[0]);

shell.pushd('b');
shell.pushd('c');
trail = shell.popd();
assert.equal(shell.error(), null);
assert.equal(trail.length, 3);
assert.equal(trail[0], path.resolve(root, 'resources/pushd/b'));
assert.equal(trail[1], path.resolve(root, 'resources/pushd'));
assert.equal(trail[2], root);
assert.equal(process.cwd(), trail[0]);

trail = shell.popd();
assert.equal(shell.error(), null);
assert.equal(trail.length, 2);
assert.equal(trail[0], path.resolve(root, 'resources/pushd'));
assert.equal(trail[1], root);
assert.equal(process.cwd(), trail[0]);

trail = shell.popd();
assert.equal(shell.error(), null);
assert.equal(trail.length, 1);
assert.equal(trail[0], root);
assert.equal(process.cwd(), trail[0]);

// Invalid
trail = shell.popd();
assert.ok(shell.error());

shell.exit(123);