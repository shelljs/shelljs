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

test('no paths given', t => {
  const result = shell.cat();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cat: no paths given');
});

test('nonexistent file', t => {
  t.is(fs.existsSync('/asdfasdf'), false); // sanity check
  const result = shell.cat('/asdfasdf'); // file does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cat: no such file or directory: /asdfasdf');
});

//
// Valids
//

test('simple', t => {
  const result = shell.cat('resources/cat/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'test1\n');
});

test('multiple files', t => {
  const result = shell.cat('resources/cat/file2', 'resources/cat/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'test2\ntest1\n');
});

test('multiple files, array syntax', t => {
  const result = shell.cat(['resources/cat/file2', 'resources/cat/file1']);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'test2\ntest1\n');
});

test('glob', t => {
  const result = shell.cat('resources/file*.txt');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.truthy(result.search('test1') > -1); // file order might be random
  t.truthy(result.search('test2') > -1);
});
