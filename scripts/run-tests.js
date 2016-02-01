#!/usr/bin/env node
/* globals cd, echo, exec, exit, ls, pwd, test */
require('../global');
var common = require('../src/common');
var cp = require('child_process');

var failed = false;

//
// Lint
//
var ESLINT_BIN = common.platform === 'win' ? 'eslint.cmd' : 'eslint';
cd(__dirname + '/..');

if (!test('-f', 'node_modules/.bin/' + ESLINT_BIN)) {
  echo('ESLint not found. Run `npm install` in the root dir first.');
  exit(1);
}

// cp.spawnSync isn't a thing on node v0.10
function spawn(path, args) {
  if (cp.spawnSync) return cp.spawnSync(path, args, { stdio: [0, 1, 2] }).status;
  return exec('node ' + ESLINT_BIN + ' ' + args.join(' ')).code;
}

// We use child_process.spawnSync so we can have colored output
if (spawn(ESLINT_BIN, ['.']) !== 0) {
  failed = true;
  echo('*** ESLint FAILED! (return code != 0)');
  echo();
} else {
  echo('ESLint Passed!');
  echo();
}

//
// Unit tests
//
cd(__dirname + '/../test');
ls('*.js').forEach(function runTest(file) {
  echo('Running test:', file);
  if (exec('node ' + file).code !== 123) { // 123 avoids false positives (e.g. premature exit)
    failed = true;
    echo('*** TEST FAILED! (missing exit code "123")');
    echo();
  }
});

if (failed) {
  echo();
  echo('*******************************************************');
  echo('WARNING: Some tests did not pass!');
  echo('*******************************************************');
  exit(1);
} else {
  echo();
  echo('All tests passed.');
}
