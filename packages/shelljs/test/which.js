var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

shell.which();
assert.ok(shell.error());

var result = shell.which('asdfasdfasdfasdfasdf'); // what are the odds...
assert.ok(!shell.error());
assert.ok(!result);

//
// Valids
//

var node = shell.which('node');
assert.equal(node.code, 0);
assert.ok(!node.stderr);
assert.ok(!shell.error());
assert.ok(fs.existsSync(node + ''));

if (process.platform === 'win32') {
    // This should be equivalent on Windows
    var nodeExe = shell.which('node.exe');
    assert.ok(!shell.error());
    // If the paths are equal, then this file *should* exist, since that's
    // already been checked.
    assert.equal(node + '', nodeExe + '');
}

shell.exit(123);
