var shell = require('..');
var path = require('path');
var assert = require('assert');

function runScript(name) {
  // prefix with 'node ' for Windows, don't prefix for OSX/Linux
  var cmd = (process.platform === 'win32' ? JSON.stringify(process.execPath)+ ' ' : '') + path.resolve(__dirname, '../bin/shjs');
  var script = path.resolve(__dirname, 'resources', 'shjs', name);
  return shell.exec(cmd + ' ' + script, { silent: true });
}

// Exit Codes
assert.equal(runScript('exit-codes.js').code, 42, 'exit code works');
assert.equal(runScript('exit-0.js').code, 0, 'exiting 0 works');

// Stdout/Stderr
var stdioRet = runScript('stdout-stderr.js');
assert.equal(stdioRet.stdout, 'stdout: OK!\n', 'stdout works');
assert.equal(stdioRet.stderr, 'stderr: OK!\n', 'stderr works');

// CoffeeScript
assert.equal(runScript('coffeescript.coffee').stdout, 'CoffeeScript: OK!\n');


// Extension detection
var extDetectRet = runScript('a-file');
assert.equal(extDetectRet.code, 0, 'error code works');
assert.equal(extDetectRet.stdout, 'OK!\n', 'stdout works');

shell.exit(123);
