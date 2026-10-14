const fs = require('fs');

const test = require('ava');

const shell = require('..');
const common = require('../src/common');
const utils = require('./utils/utils');

shell.config.silent = true;

[
  ['trailing spaces', 'value  ', 'value  \n'],
  ['trailing tab', 'value\t\n', 'value\t\n'],
  ['trailing Unicode whitespace', 'value\u00a0\n', 'value\u00a0\n'],
  ['whitespace-only line', ' \t\n', ' \t\n'],
  ['distinct final line', 'value\nvalue \n', 'value\nvalue \n'],
  ['final blank line', 'value\n\n', 'value\n\n'],
  ['blank duplicates', '\n\n', '\n'],
  ['ordinary duplicates', 'value\nvalue\n', 'value\n'],
].forEach(([name, input, expected]) => {
  test(`preserves line content: ${name}`, t => {
    const result = shell.ShellString(input).uniq();
    t.is(result.code, 0);
    t.falsy(result.stderr);
    t.is(result.stdout, expected);
  });
});

[
  ['-c', 'value\nvalue \n', '      1 value\n      1 value \n'],
  ['-d', 'value\nvalue \n', '\n'],
  ['-cd', 'value\n\n\n', '      2 \n'],
  ['-i', 'VALUE \nvalue \n', 'VALUE \n'],
].forEach(([option, input, expected]) => {
  test(`preserves line content with ${option}`, t => {
    const result = shell.ShellString(input).uniq(option);
    t.is(result.code, 0);
    t.falsy(result.stderr);
    t.is(result.stdout, expected);
  });
});

test('preserves final whitespace through file input and output', t => {
  const tmp = utils.getTempDir();
  const input = `${tmp}/input.txt`;
  const output = `${tmp}/output.txt`;
  fs.mkdirSync(tmp);
  try {
    fs.writeFileSync(input, 'value\nvalue \n\n\n');
    const result = shell.uniq('-c', input);
    t.is(result.code, 0);
    t.is(result.stdout, '      1 value\n      1 value \n      2 \n');
    const written = shell.uniq('-c', input, output);
    t.is(written.code, 0);
    t.is(written.stdout, '');
    t.is(fs.readFileSync(output, 'utf8'), result.stdout);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
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

test('empty file retains the existing count behavior', t => {
  const tmp = utils.getTempDir();
  fs.mkdirSync(tmp);
  const input = `${tmp}/empty.txt`;
  try {
    fs.writeFileSync(input, '');
    t.is(shell.uniq('-c', input).stdout, '      1 \n');
    t.is(shell.uniq(input).stdout, '\n');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('empty pipe retains the missing-input error', t => {
  const result = shell.ShellString('').uniq();
  t.is(result.code, 1);
  t.is(result.stderr, 'uniq: no input given');
});

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
