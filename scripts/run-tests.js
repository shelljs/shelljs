#!/usr/bin/env node
require('../global');

var failed = false;

cd(__dirname + '/../test');
for (file in ls('*.js')) {
  echo('Running test:', file);
  if (exec('node '+file).code !== 123) // 123 avoids false positives (e.g. premature exit)
    failed = true;
}

if (failed) {
  echo();
  echo('WARNING: Some tests did not pass!');
  exit(1);
} else {
  echo();
  echo('All tests passed.');
}
