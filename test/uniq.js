const fs = require('fs');

const test = require('ava');

const shell = require('..');
const common = require('../src/common');

shell.config.silent = true;

//
// Invalids
//

test('no args', t => {
  const result = shell.uniq();
  t.truthy(shell.error());
  t.truthy(result.code);
});

test('file does not exist', t => {
  t.falsy(fs.existsSync('/asdfasdf')); // sanity check
  const result = shell.uniq('/asdfasdf');
  t.truthy(shell.error());
  t.truthy(result.code);
});

test('directory', t => {
  t.truthy(common.statFollowLinks('test/resources/').isDirectory()); // sanity check
  const result = shell.uniq('test/resources/');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, "uniq: error reading 'test/resources/'");
});

test('output directory', t => {
  t.truthy(common.statFollowLinks('test/resources/').isDirectory()); // sanity check
  const result = shell.uniq('test/resources/file1.txt', 'test/resources/');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'uniq: test/resources/: Is a directory');
});

test('file does not exist with output directory', t => {
  t.falsy(fs.existsSync('/asdfasdf')); // sanity check
  const result = shell.uniq('/asdfasdf', 'test/resources/');
  t.is(result.code, 1);
  t.truthy(shell.error());
});

//
// Valids
//

test('uniq file1', t => {
  const result = shell.uniq('test/resources/uniq/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/uniq/file1u').toString());
});

test('uniq -i file2', t => {
  const result = shell.uniq('-i', 'test/resources/uniq/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/uniq/file2u').toString());
});

test('with glob character', t => {
  const result = shell.uniq('-i', 'test/resources/uniq/fi?e2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/uniq/file2u').toString());
});

test('uniq file1 file2', t => {
  const result = shell.uniq('test/resources/uniq/file1', 'test/resources/uniq/file1t');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(
    shell.cat('test/resources/uniq/file1u').toString(),
    shell.cat('test/resources/uniq/file1t').toString()
  );
});

test('cat file1 |uniq', t => {
  const result = shell.cat('test/resources/uniq/file1').uniq();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/uniq/file1u').toString());
});

test('uniq -c file1', t => {
  const result = shell.uniq('-c', 'test/resources/uniq/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/uniq/file1c').toString());
});

test('uniq -d file1', t => {
  const result = shell.uniq('-d', 'test/resources/uniq/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/uniq/file1d').toString());
});
