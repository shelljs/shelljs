var shell = require('..');

var assert = require('assert');
var child = require('child_process');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//


// From here on we use child.exec() to intercept the stdout


// simple test with defaults
shell.mkdir('-p', 'tmp');
var file = 'tmp/tempscript' + Math.random() + '.js';
var script = 'require(\'../../global.js\'); echo("-asdf", "111");'; // test '-' bug (see issue #20)
shell.ShellString(script).to(file);
child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err, stdout) {
  assert.equal(stdout, '-asdf 111\n');

  // using null as an explicit argument doesn't crash the function
  file = 'tmp/tempscript' + Math.random() + '.js';
  script = 'require(\'../../global.js\'); echo(null);';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err2, stdout2, stderr2) {
    assert.equal(stdout2, 'null\n');
    assert.equal(stderr2, '');

    // simple test with silent(true)
    script = 'require(\'../../global.js\'); config.silent=true; echo(555);';
    shell.ShellString(script).to(file);
    child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err3, stdout3) {
      assert.equal(stdout3, '555\n');

      script = "require('../../global.js'); echo('-e', '\\tmessage');";
      shell.ShellString(script).to(file);
      child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err4, stdout4) {
        assert.equal(stdout4, '\tmessage\n');

        theEnd();
      });
    });

    // simple test with silent(true)
  });
});

function theEnd() {
  shell.exit(123);
}
