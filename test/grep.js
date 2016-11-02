import test from 'ava';
import shell from '..';
import fs from 'fs';
import utils from './utils/utils';

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.silent = true;
  shell.cp('-r', 'resources', t.context.tmp);
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
});


//
// Invalids
//

test('no args', t => {
  const result = shell.grep();
  t.truthy(shell.error());
  t.is(result.code, 2);
});

test('too few args', t => {
  const result = shell.grep(/asdf/g); // too few args
  t.truthy(shell.error());
  t.is(result.code, 2);
});

test('no such file', t => {
  t.falsy(fs.existsSync('/asdfasdf')); // sanity check
  const result = shell.grep(/asdf/g, '/asdfasdf'); // no such file
  t.truthy(shell.error());
  t.is(result.stderr, 'grep: no such file or directory: /asdfasdf');
  t.is(result.code, 2);
});

test('if at least one file is missing, this should be an error', t => {
  t.falsy(fs.existsSync('asdfasdf')); // sanity check
  t.truthy(fs.existsSync(`${t.context.tmp}/file1`)); // sanity check
  const result = shell.grep(/asdf/g, `${t.context.tmp}/file1`, 'asdfasdf');
  t.truthy(shell.error());
  t.is(result.stderr, 'grep: no such file or directory: asdfasdf');
  t.is(result.code, 2);
});

//
// Valids
//

test('basic', t => {
  const result = shell.grep('line', 'resources/a.txt');
  t.falsy(shell.error());
  t.is(result.split('\n').length - 1, 4);
});

test('-v option', t => {
  const result = shell.grep('-v', 'line', 'resources/a.txt');
  t.falsy(shell.error());
  t.is(result.split('\n').length - 1, 8);
});

test('matches one line', t => {
  const result = shell.grep('line one', 'resources/a.txt');
  t.falsy(shell.error());
  t.is(result.toString(), 'This is line one\n');
});

test('multiple files', t => {
  const result = shell.grep(/test/, 'resources/file1.txt', 'resources/file2.txt');
  t.falsy(shell.error());
  t.is(result.toString(), 'test1\ntest2\n');
});

test('multiple files, array syntax', t => {
  const result = shell.grep(/test/, ['resources/file1.txt', 'resources/file2.txt']);
  t.falsy(shell.error());
  t.is(result.toString(), 'test1\ntest2\n');
});

test('multiple files, glob syntax, * for file name', t => {
  const result = shell.grep(/test/, 'resources/file*.txt');
  t.falsy(shell.error());
  t.truthy(result.toString(), 'test1\ntest2\n');
});

test('multiple files, glob syntax, * for directory name', t => {
  const result = shell.grep(/test/, 'r*/file*.txt');
  t.falsy(shell.error());
  t.is(result.toString(), 'test1\ntest2\n');
});

test('multiple files, double-star glob', t => {
  const result = shell.grep(/test/, 'resources/**/file*.js');
  t.falsy(shell.error());
  t.is(result.toString(), 'test\ntest\ntest\ntest\n');
});

test('one file, * in regex', t => {
  const result = shell.grep(/alpha*beta/, 'resources/grep/file');
  t.falsy(shell.error());
  t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
});

test('one file, * in string-regex', t => {
  const result = shell.grep('alpha*beta', 'resources/grep/file');
  t.falsy(shell.error());
  t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
});

test('one file, * in regex, make sure * is not globbed', t => {
  const result = shell.grep(/l*\.js/, 'resources/grep/file');
  t.falsy(shell.error());
  t.is(result.toString(), 'this line ends in.js\nlllllllllllllllll.js\n');
});

test('one file, * in string-regex, make sure * is not globbed', t => {
  const result = shell.grep('l*\\.js', 'resources/grep/file');
  t.falsy(shell.error());
  t.is(result.toString(), 'this line ends in.js\nlllllllllllllllll.js\n');
});

test('-l option', t => {
  const result = shell.grep('-l', 'test1', 'resources/file1', 'resources/file2', 'resources/file1.txt');
  t.falsy(shell.error());
  t.truthy(result.match(/file1(\n|$)/));
  t.truthy(result.match(/file1.txt/));
  t.falsy(result.match(/file2.txt/));
  t.is(result.split('\n').length - 1, 2);
});
