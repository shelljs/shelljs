var shell = require('..');

var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//

assert.equal(shell.env['PATH'], process.env['PATH']);

shell.env['MAKERJS_TEST'] = 'hello world';
assert.equal(shell.env['MAKERJS_TEST'], process.env['MAKERJS_TEST']);

shell.exit(123);
