var shell = require('..');

var assert = require('assert');
var child = require('child_process');

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

var callbackTests = 2;
function done() {
  callbackTests -= 1;
  if (callbackTests === 0) {
    assert.equal(shell.error(), null);
    shell.exit(123);
  }
}

var file;
var script;

//
// config.fatal = false
//
shell.mkdir('-p', 'tmp');
file = 'tmp/tempscript' + Math.random() + '.js';
script = 'require(\'../../global.js\');' +
  'config.silent=true; config.fatal=false;' +
  ' cp("this_file_doesnt_exist", "."); echo("got here");';
script.to(file);
child.exec('node ' + file, function cb1(err, stdout) {
  assert.ok(stdout.match('got here'));

  done();
});

//
// config.fatal = true
//
shell.mkdir('-p', 'tmp');
file = 'tmp/tempscript' + Math.random() + '.js';
script = 'require(\'../../global.js\');' +
  'config.silent=true; config.fatal=true;' +
  'cp("this_file_doesnt_exist", "."); echo("got here");';
script.to(file);
child.exec('node ' + file, function cb2(err, stdout) {
  assert.ok(!stdout.match('got here'));

  done();
});
