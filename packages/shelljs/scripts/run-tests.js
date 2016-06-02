#!/usr/bin/env node
/* globals cd, echo, exec, exit, ls, pwd, test */
require('../global');
var common = require('../src/common');

var failed = false;

//
// Lint
//
var JSHINT_BIN = 'node_modules/jshint/bin/jshint';
cd(__dirname + '/..');

if (!test('-f', JSHINT_BIN)) {
  echo('JSHint not found. Run `npm install` in the root dir first.');
  exit(1);
}

var jsfiles = common.expand([pwd() + '/*.js',
                             pwd() + '/scripts/*.js',
                             pwd() + '/src/*.js',
                             pwd() + '/test/*.js'
                            ]).join(' ');
// Perform linting on all javascript files
if (exec(JSON.stringify(process.execPath)+' '+pwd()+'/'+JSHINT_BIN+' '+jsfiles).code !== 0) {
  failed = true;
  echo('*** JSHINT FAILED! (return code != 0)');
} else {
  echo('All JSHint tests passed');
}
echo();

//
// Unit tests
//
cd(__dirname + '/../test');
ls('*.js').forEach(function(file) {
  echo('Running test:', file);
  if (exec(JSON.stringify(process.execPath)+' '+file).code !== 123) { // 123 avoids false positives (e.g. premature exit)
    failed = true;
    echo('*** TEST FAILED! (missing exit code "123")');
    echo();
  }
});

echo();

if (failed) {
  echo('*******************************************************');
  echo('WARNING: Some tests did not pass!');
  echo('*******************************************************');
  exit(1);
} else {
  echo('All tests passed.');
}
