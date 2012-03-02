#!/usr/bin/env node
require('../global');

cd(__dirname + '/../test');
for (file in ls('*.js')) {
  echo('Running test:', file);
  exec('node '+file);
}
