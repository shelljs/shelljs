var shell = require('..');

var assert = require('assert');
var path = require('path');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

var _pwd;

//
// Valids
//

_pwd = shell.pwd();
assert.equal(shell.error(), null);
assert.equal(_pwd, path.resolve('.'));

shell.cd('tmp');
_pwd = shell.pwd();
assert.equal(shell.error(), null);
assert.equal(path.basename(_pwd), 'tmp');

shell.exit(123);
