import test from 'ava';
import shell from '..';
import fs from 'fs';

test.beforeEach(() => {
  shell.config.silent = true;
});

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
  const result = shell.sort('/adsfasdf');
  t.truthy(shell.error());
  t.truthy(result.code);
});

//
// Valids
//

test('uniq file1', t => {
  const result = shell.uniq('resources/uniq/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/uniq/file1u').toString());
});

test('uniq -i file2', t => {
  const result = shell.uniq('-i', 'resources/uniq/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/uniq/file2u').toString());
});

test('with glob character', t => {
  const result = shell.uniq('-i', 'resources/uniq/fi?e2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/uniq/file2u').toString());
});

test('uniq file1 file2', t => {
  const result = shell.uniq('resources/uniq/file1', 'resources/uniq/file1t');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(
    shell.cat('resources/uniq/file1u').toString(),
    shell.cat('resources/uniq/file1t').toString()
  );
});

test('cat file1 |uniq', t => {
  const result = shell.cat('resources/uniq/file1').uniq();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/uniq/file1u').toString());
});

test('uniq -c file1', t => {
  const result = shell.uniq('-c', 'resources/uniq/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/uniq/file1c').toString());
});

test('uniq -d file1', t => {
  const result = shell.uniq('-d', 'resources/uniq/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/uniq/file1d').toString());
});
