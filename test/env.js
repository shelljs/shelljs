require('../maker');

var assert = require('assert');

silent();

shell.rm('-rf', 'tmp');
shell.mkdir('tmp')

//
// Valids
//

assert.equal(env['PATH'], process.env['PATH']);

env['MAKERJS_TEST'] = 'hello world';
assert.equal(env['MAKERJS_TEST'], process.env['MAKERJS_TEST']);

exit(123);  
