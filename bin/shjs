#!/usr/bin/env node
require('../global');

if (process.argv.length < 3) {
  console.log('ShellJS: missing argument (script name)');
  console.log();
  process.exit(1);
}

var scriptName = process.argv[2];
env['NODE_PATH'] = __dirname + '/../..';

if (!scriptName.match(/\.js/) && !scriptName.match(/\.coffee/)) {
  if (test('-f', scriptName + '.js'))
    scriptName += '.js';
  if (test('-f', scriptName + '.coffee'))
    scriptName += '.coffee';
}

if (!test('-f', scriptName)) {
  console.log('ShellJS: script not found ('+scriptName+')');
  console.log();
  process.exit(1);
}


if (scriptName.match(/\.coffee$/)) {
  //
  // CoffeeScript
  //
  if (which('coffee')) {
    exec('coffee ' + scriptName, { async: true });
  } else {
    console.log('ShellJS: CoffeeScript interpreter not found');
    console.log();
    process.exit(1);
  }
} else {
  //
  // JavaScript
  //
  exec('node ' + scriptName, { async: true });
}
