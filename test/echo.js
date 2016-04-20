var shell = require('..');

var assert = require('assert'),
    child = require('child_process');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//


// From here on we use child.exec() to intercept the stdout


// simple test with defaults
shell.mkdir('-p', 'tmp');
var file = 'tmp/tempscript'+Math.random()+'.js',
    script = 'require(\'../../global.js\'); echo("-asdf", "111");'; // test '-' bug (see issue #20)
shell.ShellString(script).to(file);
child.exec(JSON.stringify(process.execPath)+' '+file, function(err, stdout) {
  assert.equal(stdout, '-asdf 111\n');

  // using null as an explicit argument doesn't crash the function
  file = 'tmp/tempscript'+Math.random()+'.js';
  script = 'require(\'../../global.js\'); echo(null);';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath)+' '+file, function(err, stdout, stderr) {
    assert.equal(stdout, 'null\n');
    assert.equal(stderr, '');

    // simple test with silent(true)
    shell.mkdir('-p', 'tmp');
    var file = 'tmp/tempscript'+Math.random()+'.js',
        script = 'require(\'../../global.js\'); config.silent=true; echo(555);';
    shell.ShellString(script).to(file);
    child.exec(JSON.stringify(process.execPath)+' '+file, function(err, stdout) {
      assert.equal(stdout, '555\n');

      theEnd();
    });
  });
});

function theEnd() {
  shell.exit(123);
}
