var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

var result;

var doubleSorted = shell.cat('resources/sort/sorted')
                        .trimRight()
                        .split('\n')
                        .reduce(function(prev, cur) {
                          return prev.concat([cur, cur]);
                        }, [])
                        .join('\n') + '\n';

//
// Invalids
//

result = shell.sort();
assert.ok(shell.error());
assert.ok(result.code);

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
result = shell.sort('/adsfasdf'); // file does not exist
assert.ok(shell.error());
assert.ok(result.code);

//
// Valids
//

// simple
result = shell.sort('resources/sort/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/sort/sorted'));

// simple
result = shell.sort('resources/sort/file2');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/sort/sorted'));

// multiple files
result = shell.sort('resources/sort/file2', 'resources/sort/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', doubleSorted);

// multiple files, array syntax
result = shell.sort(['resources/sort/file2', 'resources/sort/file1']);
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', doubleSorted);

// Globbed file
result = shell.sort('resources/sort/file?');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', doubleSorted);

// With '-n' option
result = shell.sort('-n', 'resources/sort/file2');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/sort/sortedDashN'));

// With '-r' option
result = shell.sort('-r', 'resources/sort/file2');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/sort/sorted')
                          .trimRight()
                          .split('\n')
                          .reverse()
                          .join('\n') + '\n');

// With '-rn' option
result = shell.sort('-rn', 'resources/sort/file2');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result + '', shell.cat('resources/sort/sortedDashN')
                          .trimRight()
                          .split('\n')
                          .reverse()
                          .join('\n') + '\n');

shell.exit(123);
