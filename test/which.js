var shell = require('..');

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

shell.which();
assert.ok(shell.error());

var result = shell.which('asdfasdfasdfasdfasdf'); // what are the odds...
assert.ok(!shell.error());
assert.ok(!result);

//
// Valids
//

var node = shell.which('node');
assert.equal(node.code, 0);
assert.ok(!node.stderr);
assert.ok(!shell.error());
assert.ok(fs.existsSync(node + ''));

if (process.platform === 'win32') {
  // This should be equivalent on Windows
  var nodeExe = shell.which('node.exe');
  assert.ok(!shell.error());
  // If the paths are equal, then this file *should* exist, since that's
  // already been checked.
  assert.equal(node + '', nodeExe + '');
}

/*
 Tests for nodepath
 */
var cwd = path.resolve(process.cwd(), '..');

function stubProcessData() {
  sandbox.stub(process.env, 'PATH', '');
  sandbox.stub(process, 'cwd', function () { return cwd; }); // test are ran from test folder
}

// fails since nodepath is not set
stubProcessData();
result = shell.which('eslint');
assert.ok(!shell.error());
assert.ok(!result);
sandbox.restore();

// pass
shell.config.nodepath = true;
stubProcessData();
result = shell.which('eslint');
assert.equal(result.code, 0);
assert.ok(!result.stderr);
assert.ok(!shell.error());
sandbox.restore();
shell.config.nodepath = false; // set it back to default

shell.exit(123);
