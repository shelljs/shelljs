import test from 'ava';
import shell from '..';
import fs from 'fs';
import utils from './utils/utils';

const numLines = utils.numLines;
let TMP;

test.beforeEach(() => {
  TMP = utils.getTempDir();
  shell.config.silent = true;
  shell.cp('-r', 'resources', TMP);
  shell.cd(TMP);
});

test.afterEach(() => {
  shell.cd('..');
  shell.rm('-rf', TMP);
});


//
// Invalids
//

test('no args', t => {
  const result = shell.mv();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: missing <source> and/or <dest>');
});

test('one arg', t => {
  const result = shell.mv('file1');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: missing <source> and/or <dest>');
});

test('option only', t => {
  const result = shell.mv('-f');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: missing <source> and/or <dest>');
});

test('option not supported', t => {
  const result = shell.mv('-Z', 'file1', 'file1');
  t.truthy(shell.error());
  t.is(fs.existsSync('file1'), true);
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: option not recognized: Z');
});

test('source does not exist', t => {
  const result = shell.mv('asdfasdf', '..');
  t.truthy(shell.error());
  t.is(numLines(shell.error()), 1);
  t.is(fs.existsSync('../asdfasdf'), false);
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: no such file or directory: asdfasdf');
});

test('sources do not exist', t => {
  const result = shell.mv('asdfasdf1', 'asdfasdf2', '..');
  t.truthy(shell.error());
  t.is(numLines(shell.error()), 2);
  t.is(fs.existsSync('../asdfasdf1'), false);
  t.is(fs.existsSync('../asdfasdf2'), false);
  t.is(result.code, 1);
  t.is(
    result.stderr,
    'mv: no such file or directory: asdfasdf1\nmv: no such file or directory: asdfasdf2'
  );
});

test('too many sources (dest is file)', t => {
  const result = shell.mv('asdfasdf1', 'asdfasdf2', 'file1');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest is not a directory (too many sources)');
});

test('-n is no-force/no-clobber', t => {
  const result = shell.mv('-n', 'file1', 'file2');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest file already exists: file2');
});

test('-f is the default behavior', t => {
  const result = shell.mv('file1', 'file2'); // dest already exists (but that's ok)
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
});

test('-fn is the same as -n', t => {
  const result = shell.mv('-fn', 'file1', 'file2');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest file already exists: file2');
});

test('too many sources (exist, but dest is file)', t => {
  const result = shell.mv('file1', 'file2', 'a_file');
  t.truthy(shell.error());
  t.is(fs.existsSync('a_file'), false);
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest is not a directory (too many sources)');
});

test('can\'t use wildcard when dest is file', t => {
  const result = shell.mv('file*', 'file1');
  t.truthy(shell.error());
  t.is(fs.existsSync('file1'), true);
  t.is(fs.existsSync('file2'), true);
  t.is(fs.existsSync('file1.js'), true);
  t.is(fs.existsSync('file2.js'), true);
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest is not a directory (too many sources)');
});

//
// Valids
//

test('handles self OK', t => {
  const TMP2 = `${TMP}-2`;
  shell.mkdir(TMP2);
  let result = shell.mv('*', TMP2); // has to handle self (TMP2 --> TMP2) without throwing error
  t.truthy(shell.error()); // there's an error, but not fatal
  t.is(fs.existsSync(`${TMP2}/file1`), true); // moved OK
  t.is(result.code, 1);
  result = shell.mv(`${TMP2}/*`, '.'); // revert
  t.is(fs.existsSync('file1'), true); // moved OK
  t.is(result.code, 0);
});

test('one source', t => {
  let result = shell.mv('file1', 'file3');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(fs.existsSync('file1'), false);
  t.is(fs.existsSync('file3'), true);
  result = shell.mv('file3', 'file1'); // revert
  t.is(shell.error(), null);
  t.is(fs.existsSync('file1'), true);
  t.is(result.code, 0);
});

test('two sources', t => {
  shell.rm('-rf', 't');
  shell.mkdir('-p', 't');
  let result = shell.mv('file1', 'file2', 't');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(fs.existsSync('file1'), false);
  t.is(fs.existsSync('file2'), false);
  t.is(fs.existsSync('t/file1'), true);
  t.is(fs.existsSync('t/file2'), true);
  result = shell.mv('t/*', '.'); // revert
  t.is(result.code, 0);
  t.is(fs.existsSync('file1'), true);
  t.is(fs.existsSync('file2'), true);
});

test('two sources, array style', t => {
  shell.rm('-rf', 't');
  shell.mkdir('-p', 't');
  let result = shell.mv(['file1', 'file2'], 't'); // two sources
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(fs.existsSync('file1'), false);
  t.is(fs.existsSync('file2'), false);
  t.is(fs.existsSync('t/file1'), true);
  t.is(fs.existsSync('t/file2'), true);
  result = shell.mv('t/*', '.'); // revert
  t.is(fs.existsSync('file1'), true);
  t.is(fs.existsSync('file2'), true);
});

test('wildcard', t => {
  shell.mkdir('-p', 't');
  let result = shell.mv('file*.js', 't'); // wildcard
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(fs.existsSync('file1.js'), false);
  t.is(fs.existsSync('file2.js'), false);
  t.is(fs.existsSync('t/file1.js'), true);
  t.is(fs.existsSync('t/file2.js'), true);
  result = shell.mv('t/*', '.'); // revert
  t.is(fs.existsSync('file1.js'), true);
  t.is(fs.existsSync('file2.js'), true);
});

test('dest exists, but -f given', t => {
  const result = shell.mv('-f', 'file1', 'file2');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(fs.existsSync('file1'), false);
  t.is(fs.existsSync('file2'), true);
});
