var shell = require('..');

var assert = require('assert');
var child = require('child_process');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//

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

// From here on we use child.exec() to intercept the stdout


// simple test with defaults
shell.mkdir('-p', 'tmp');
file = 'tmp/tempscript' + Math.random() + '.js';
script = 'require(\'../../global.js\'); echo("-asdf", "111");'; // test '-' bug (see issue #20)
script.to(file);
child.exec('node ' + file, function cb1(err, stdout) {
  assert.ok(
    stdout === '-asdf 111\n' ||
    stdout === '-asdf 111\nundefined\n' // 'undefined' for v0.4
  );

  done();
});

// simple test with silent(true)
shell.mkdir('-p', 'tmp');
file = 'tmp/tempscript' + Math.random() + '.js';
script = 'require(\'../../global.js\'); config.silent=true; echo(555);';
script.to(file);
child.exec('node ' + file, function cb2(err, stdout) {
  assert.ok(
    stdout === '555\n' ||
    stdout === '555\nundefined\n' // 'undefined' for v0.4
  );

  done();
});
