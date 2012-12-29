#!/usr/bin/env node
require('../global');

var path = require('path');

var failed = false;

cd(__dirname + '/../test');
ls('*.js').forEach(function(file) {
  echo('Running test:', file);
  if (exec('node ' + file, { cwd: path.resolve(__dirname, '/../test') }).code !== 123) { // 123 avoids false positives (e.g. premature exit)
    failed = true;
    echo('*** TEST FAILED! (missing exit code "123")');
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
