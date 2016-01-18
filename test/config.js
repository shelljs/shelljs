var shell = require('..');

var assert = require('assert'),
    child = require('child_process');

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
// config.logCmd
//

assert.equal(shell.config.logCmd, false); // default


shell.mkdir('-p', 'tmp');

// doing, when logCmd is turned off -> stdout should be empty
var file = 'tmp/tempscript'+Math.random()+".js";
var script = 'require(\'../../global.js\'); config.silent=true; config.logCmd=false; mkdir("-p","somefolder1");';
script.to(file);
child.exec('node '+file, function(err, stdout) {
    assert.ok(stdout.match(''));
});

// issuing a dedicated shelljs command with a parameter, while logCmd is turned on > should print the command and its parameters
var file = 'tmp/tempscript'+Math.random()+'.js';
var script = 'require(\'../../global.js\'); config.silent=true; config.logCmd=true; mkdir("-p","somefolder2");';
script.to(file);
child.exec('node '+file, function(err, stdout) {
    assert.ok(stdout.match('mkdir -p somefolder2'));
});

// doing the same with the exec command, while the exec command should not be printed (only its args, shall be printed)
var file = 'tmp/tempscript'+Math.random()+'.js';
var script = 'require(\'../../global.js\'); config.silent=true; config.logCmd=true; exec("mkdir somefolder3");';
script.to(file);
child.exec('node '+file, function(err, stdout) {
    assert.ok(stdout.match('mkdir somefolder3'));
});


//
// config.fatal = false
//
shell.mkdir('-p', 'tmp');
var file = 'tmp/tempscript'+Math.random()+'.js',
    script = 'require(\'../../global.js\'); config.silent=true; config.fatal=false; cp("this_file_doesnt_exist", "."); echo("got here");';
script.to(file);
child.exec('node '+file, function(err, stdout) {
  assert.ok(stdout.match('got here'));

  //
  // config.fatal = true
  //
  shell.mkdir('-p', 'tmp');
  var file = 'tmp/tempscript'+Math.random()+'.js',
      script = 'require(\'../../global.js\'); config.silent=true; config.fatal=true; cp("this_file_doesnt_exist", "."); echo("got here");';
  script.to(file);
  child.exec('node '+file, function(err, stdout) {
    assert.ok(!stdout.match('got here'));

    shell.exit(123);
  });
});