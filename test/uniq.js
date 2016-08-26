import test from 'ava';
import shell from '..';
import fs from 'fs';

let TMP;

test.beforeEach(() => {
  TMP = require('./utils/utils').getTempDir();
  shell.config.silent = true;

  shell.rm('-rf', TMP);
  shell.mkdir(TMP);
});


//
// Invalids
//

test('No Test Title #45', t => {
  const result = shell.uniq();
  t.truthy(shell.error());
  t.truthy(result.code);
});

test('No Test Title #46', t => {
  t.is(fs.existsSync('/asdfasdf'), false); // sanity check
  const result = shell.sort('/adsfasdf'); // file does not exist
  t.truthy(shell.error());
  t.truthy(result.code);
});

//
// Valids
//

test('uniq file1', t => {
  const result = shell.uniq('resources/uniq/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result + '', shell.cat('resources/uniq/file1u').toString());
});

test('uniq -i file2', t => {
  const result = shell.uniq('-i', 'resources/uniq/file2');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result + '', shell.cat('resources/uniq/file2u').toString());
});

test('with glob character', t => {
  const result = shell.uniq('-i', 'resources/uniq/fi?e2');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result + '', shell.cat('resources/uniq/file2u').toString());
});

test('uniq file1 file2', t => {
  const result = shell.uniq('resources/uniq/file1', 'resources/uniq/file1t');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(
    shell.cat('resources/uniq/file1u').toString(),
    shell.cat('resources/uniq/file1t').toString()
  );
});

test('cat file1 |uniq', t => {
  const result = shell.cat('resources/uniq/file1').uniq();
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result + '', shell.cat('resources/uniq/file1u').toString());
});

test('uniq -c file1', t => {
  const result = shell.uniq('-c', 'resources/uniq/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result + '', shell.cat('resources/uniq/file1c').toString());
});

test('uniq -d file1', t => {
  const result = shell.uniq('-d', 'resources/uniq/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result + '', shell.cat('resources/uniq/file1d').toString());
});
