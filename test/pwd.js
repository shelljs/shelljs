var shell = require('..');

var assert = require('assert'),
    path = require('path');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//

var _pwd = shell.pwd();
assert.equal(shell.error(), null);
assert.equal(_pwd.code, 0);
assert.ok(!_pwd.stderr);
assert.equal(_pwd, path.resolve('.'));

shell.cd('tmp');
_pwd = shell.pwd();
assert.equal(_pwd.code, 0);
assert.ok(!_pwd.stderr);
assert.equal(shell.error(), null);
assert.equal(path.basename(_pwd.toString()), 'tmp');

shell.exit(123);
