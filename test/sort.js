import fs from 'fs';

import test from 'ava';

import shell from '..';
import common from '../src/common';

shell.config.silent = true;

const doubleSorted = shell.cat('test/resources/sort/sorted')
                        .trimRight()
                        .split('\n')
                        .reduce((prev, cur) => prev.concat([cur, cur]), [])
                        .join('\n') + '\n';


//
// Invalids
//

test('no args', t => {
  const result = shell.sort();
  t.truthy(shell.error());
  t.truthy(result.code);
});

test('file does not exist', t => {
  t.falsy(fs.existsSync('/asdfasdf')); // sanity check
  const result = shell.sort('/asdfasdf');
  t.truthy(shell.error());
  t.truthy(result.code);
});

test('directory', t => {
  t.truthy(common.statFollowLinks('test/resources/').isDirectory()); // sanity check
  const result = shell.sort('test/resources/');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'sort: read failed: test/resources/: Is a directory');
});

//
// Valids
//

test('simple', t => {
  const result = shell.sort('test/resources/sort/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/sort/sorted').toString());
});

test('simple #2', t => {
  const result = shell.sort('test/resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/sort/sorted').toString());
});

test('multiple files', t => {
  const result = shell.sort('test/resources/sort/file2', 'test/resources/sort/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), doubleSorted);
});

test('multiple files, array syntax', t => {
  const result = shell.sort(['test/resources/sort/file2', 'test/resources/sort/file1']);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), doubleSorted);
});

test('Globbed file', t => {
  const result = shell.sort('test/resources/sort/file?');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), doubleSorted);
});

test('With \'-n\' option', t => {
  const result = shell.sort('-n', 'test/resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/sort/sortedDashN').toString());
});

test('With \'-r\' option', t => {
  const result = shell.sort('-r', 'test/resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/sort/sorted')
    .trimRight()
    .split('\n')
    .reverse()
    .join('\n') + '\n');
});

test('With \'-rn\' option', t => {
  const result = shell.sort('-rn', 'test/resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/sort/sortedDashN')
    .trimRight()
    .split('\n')
    .reverse()
    .join('\n') + '\n');
});
