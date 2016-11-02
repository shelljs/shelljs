import test from 'ava';
import shell from '..';
import fs from 'fs';
import utils from './utils/utils';

const CWD = process.cwd();
const numLines = utils.numLines;

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.silent = true;
  shell.cp('-r', 'resources', t.context.tmp);
  shell.cd(t.context.tmp);
});

test.afterEach.always(t => {
  process.chdir(CWD);
  shell.rm('-rf', t.context.tmp);
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
  t.truthy(fs.existsSync('file1')); // precondition
  const result = shell.mv('-Z', 'file1', 'file1');
  t.truthy(shell.error());
  t.truthy(fs.existsSync('file1'));
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: option not recognized: Z');
});

test('source does not exist', t => {
  const result = shell.mv('asdfasdf', '..');
  t.truthy(shell.error());
  t.is(numLines(shell.error()), 1);
  t.falsy(fs.existsSync('../asdfasdf'));
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: no such file or directory: asdfasdf');
});

test('sources do not exist', t => {
  const result = shell.mv('asdfasdf1', 'asdfasdf2', '..');
  t.truthy(shell.error());
  t.is(numLines(shell.error()), 2);
  t.falsy(fs.existsSync('../asdfasdf1'));
  t.falsy(fs.existsSync('../asdfasdf2'));
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
  t.falsy(fs.existsSync('a_file'));
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest is not a directory (too many sources)');
});

test('can\'t use wildcard when dest is file', t => {
  const result = shell.mv('file*', 'file1');
  t.truthy(shell.error());
  t.truthy(fs.existsSync('file1'));
  t.truthy(fs.existsSync('file2'));
  t.truthy(fs.existsSync('file1.js'));
  t.truthy(fs.existsSync('file2.js'));
  t.is(result.code, 1);
  t.is(result.stderr, 'mv: dest is not a directory (too many sources)');
});

//
// Valids
//

test('handles self OK', t => {
  const tmp2 = `${t.context.tmp}-2`;
  shell.mkdir(tmp2);
  let result = shell.mv('*', tmp2); // has to handle self (tmp2 --> tmp2) without throwing error
  t.truthy(shell.error()); // there's an error, but not fatal
  t.truthy(fs.existsSync(`${tmp2}/file1`)); // moved OK
  t.is(result.code, 1);
  result = shell.mv(`${tmp2}/*`, '.'); // revert
  t.truthy(fs.existsSync('file1')); // moved OK
  t.is(result.code, 0);
});

test('one source', t => {
  let result = shell.mv('file1', 'file3');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync('file1'));
  t.truthy(fs.existsSync('file3'));
  result = shell.mv('file3', 'file1'); // revert
  t.falsy(shell.error());
  t.truthy(fs.existsSync('file1'));
  t.is(result.code, 0);
});

test('two sources', t => {
  shell.rm('-rf', 't');
  shell.mkdir('-p', 't');
  let result = shell.mv('file1', 'file2', 't');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync('file1'));
  t.falsy(fs.existsSync('file2'));
  t.truthy(fs.existsSync('t/file1'));
  t.truthy(fs.existsSync('t/file2'));
  result = shell.mv('t/*', '.'); // revert
  t.is(result.code, 0);
  t.truthy(fs.existsSync('file1'));
  t.truthy(fs.existsSync('file2'));
});

test('two sources, array style', t => {
  shell.rm('-rf', 't');
  shell.mkdir('-p', 't');
  let result = shell.mv(['file1', 'file2'], 't'); // two sources
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync('file1'));
  t.falsy(fs.existsSync('file2'));
  t.truthy(fs.existsSync('t/file1'));
  t.truthy(fs.existsSync('t/file2'));
  result = shell.mv('t/*', '.'); // revert
  t.truthy(fs.existsSync('file1'));
  t.truthy(fs.existsSync('file2'));
});

test('wildcard', t => {
  shell.mkdir('-p', 't');
  let result = shell.mv('file*.js', 't'); // wildcard
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync('file1.js'));
  t.falsy(fs.existsSync('file2.js'));
  t.truthy(fs.existsSync('t/file1.js'));
  t.truthy(fs.existsSync('t/file2.js'));
  result = shell.mv('t/*', '.'); // revert
  t.truthy(fs.existsSync('file1.js'));
  t.truthy(fs.existsSync('file2.js'));
});

test('dest exists, but -f given', t => {
  const result = shell.mv('-f', 'file1', 'file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync('file1'));
  t.truthy(fs.existsSync('file2'));
});
