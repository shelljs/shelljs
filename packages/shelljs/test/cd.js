var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    common = require('../src/common');

shell.config.silent = true;

// save current dir
var cur = shell.pwd();

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
var result = shell.cd('/asdfasdf'); // dir does not exist
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'cd: no such file or directory: /asdfasdf');

assert.equal(fs.existsSync('resources/file1'), true); // sanity check
result = shell.cd('resources/file1'); // file, not dir
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'cd: not a directory: resources/file1');

result = shell.cd('-'); // Haven't changed yet, so there is no previous directory
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'cd: could not find previous directory');

//
// Valids
//

result = shell.cd(cur);
result = shell.cd('tmp');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(path.basename(process.cwd()), 'tmp');

result = shell.cd(cur);
result = shell.cd('/');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(process.cwd(), path.resolve('/'));

result = shell.cd(cur);
result = shell.cd('/');
result = shell.cd('-');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(process.cwd(), path.resolve(cur.toString()));

// cd + other commands

result = shell.cd(cur);
result = shell.rm('-f', 'tmp/*');
assert.equal(fs.existsSync('tmp/file1'), false);
result = shell.cd('resources');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
result = shell.cp('file1', '../tmp');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
result = shell.cd('../tmp');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('file1'), true);

// Test tilde expansion

result = shell.cd('~');
assert.equal(process.cwd(), common.getUserHome());
result = shell.cd('..');
assert.notEqual(process.cwd(), common.getUserHome());
result = shell.cd('~'); // Change back to home
assert.equal(process.cwd(), common.getUserHome());

// Goes to home directory if no arguments are passed
result = shell.cd(cur);
result = shell.cd();
assert.ok(!shell.error());
assert.equal(result.code, 0);
assert.equal(process.cwd(), common.getUserHome());

shell.exit(123);
