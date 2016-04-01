var shell = require('..');

var assert = require('assert'),
    child = require('child_process');
var common = require('../src/common');

//
// config.silent
//

assert.equal(shell.config.silent, false); // default

shell.config.silent = true;
assert.equal(shell.config.silent, true);

shell.config.silent = false;
assert.equal(shell.config.silent, false);

//
// config.fatal
//

assert.equal(shell.config.fatal, false); // default

//
// config.fatal = false
//
shell.mkdir('-p', 'tmp');
var file = 'tmp/tempscript'+Math.random()+'.js',
    script = 'require(\'../../global.js\'); config.silent=true; config.fatal=false; cp("this_file_doesnt_exist", "."); echo("got here");';
shell.ShellString(script).to(file);
child.exec(JSON.stringify(process.execPath)+' '+file, function(err, stdout) {
  assert.ok(stdout.match('got here'));

  //
  // config.fatal = true
  //
  shell.mkdir('-p', 'tmp');
  var file = 'tmp/tempscript'+Math.random()+'.js',
      script = 'require(\'../../global.js\'); config.silent=true; config.fatal=true; cp("this_file_doesnt_exist", "."); echo("got here");';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath)+' '+file, function(err, stdout) {
    assert.ok(!stdout.match('got here'));

    shell.exit(123);
  });
});

//
// config.globOptions
//

// Expands to directories by default
var result = common.expand(['resources/*a*']);
assert.equal(result.length, 5);
assert.ok(result.indexOf('resources/a.txt') > -1);
assert.ok(result.indexOf('resources/badlink') > -1);
assert.ok(result.indexOf('resources/cat') > -1);
assert.ok(result.indexOf('resources/head') > -1);
assert.ok(result.indexOf('resources/external') > -1);

// Check to make sure options get passed through (nodir is an example)
shell.config.globOptions = {nodir: true};
result = common.expand(['resources/*a*']);
assert.equal(result.length, 2);
assert.ok(result.indexOf('resources/a.txt') > -1);
assert.ok(result.indexOf('resources/badlink') > -1);
assert.ok(result.indexOf('resources/cat') < 0);
assert.ok(result.indexOf('resources/external') < 0);
