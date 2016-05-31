var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

var result;

result = shell.uniq();
assert.ok(shell.error());
assert.ok(result.code);

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
result = shell.sort('/adsfasdf'); // file does not exist
assert.ok(shell.error());
assert.ok(result.code);

result = shell.uniq('resources/uniq/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/uniq/file1u').trimRight() + '\n');

result = shell.uniq('-i', 'resources/uniq/file2');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/uniq/file2u').trimRight() + '\n');

shell.exit(123);
