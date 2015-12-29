var shell = require('..');

var assert = require('assert'),
    child = require('child_process');

shell.config.silent = true;

//
// Valids
//

// Check that we correctly detect commands that fail
shell.cat();
assert.equal(shell.errorCode(), 1);

var result = shell.exec('asdfasdf'); // could not find command
assert.ok(result.code > 0);
assert.equal(shell.errorCode(), result.code);

// Check that we correctly detect commands that succeed
shell.pwd(); // safe to assume this will succeed
assert.equal(shell.errorCode(), 0);

// Check that we return the error code of the last command
var file = 'tmp/tempscript'+Math.random()+'.js',
    script = 'require(\'../../global.js\'); config.silent=true; config.fatal=false; cp("this_file_doesnt_exist", "."); echo("this command will succeed");';
script.to(file);
child.exec('node '+file, function() {
  assert.equal(shell.errorCode(), 0);
  shell.exit(123);
});
