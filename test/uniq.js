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

//uniq file1
result = shell.uniq('resources/uniq/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/uniq/file1u').trimRight() + '\n');

//uniq -i file2
result = shell.uniq('-i', 'resources/uniq/file2');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/uniq/file2u').trimRight() + '\n');

//uniq file1 file2
shell.uniq('resources/uniq/file1', 'resources/uniq/file1t');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(shell.cat('resources/uniq/file1u').trimRight(), 
             shell.cat('resources/uniq/file1t').trimRight());
             
//cat file1 |uniq
result = shell.cat('resources/uniq/file1').uniq();
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/uniq/file1u').trimRight() + '\n');

//uniq -c file1
result = shell.uniq('-c', 'resources/uniq/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/uniq/file1c').trimRight() + '\n');

//uniq -d file1
result = shell.uniq('-d', 'resources/uniq/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/uniq/file1d').trimRight() + '\n');

shell.exit(123);
