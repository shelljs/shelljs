var shell = require('..');
var child = require('child_process');
var assert = require('assert');

shell.mkdir('-p', 'tmp');
var file = 'tmp/tempscript' + Math.random() + '.js';
var script = 'require(\'../../make.js\');' +
             'target.all=function(){' +
             '  echo("first"); ' +
             '  cp("this_file_doesnt_exist", ".");' +
             '  echo("second");' +
             '}';

shell.ShellString(script).to(file);
child.exec(JSON.stringify(process.execPath) + ' ' + file, function (err, stdout) {
  assert.ok(stdout.match('first'));
  assert.ok(!stdout.match('second')); // Make should die on errors, so this should never get echoed

  shell.exit(123);
});
