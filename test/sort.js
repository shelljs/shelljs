import test from 'ava';
import shell from '..';
import fs from 'fs';

test.beforeEach(() => {
  shell.config.silent = true;
});

const doubleSorted = shell.cat('resources/sort/sorted')
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
  const result = shell.sort('/adsfasdf');
  t.truthy(shell.error());
  t.truthy(result.code);
});

//
// Valids
//

test('simple', t => {
  const result = shell.sort('resources/sort/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/sort/sorted').toString());
});

test('simple', t => {
  const result = shell.sort('resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/sort/sorted').toString());
});

test('multiple files', t => {
  const result = shell.sort('resources/sort/file2', 'resources/sort/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), doubleSorted);
});

test('multiple files, array syntax', t => {
  const result = shell.sort(['resources/sort/file2', 'resources/sort/file1']);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), doubleSorted);
});

test('Globbed file', t => {
  const result = shell.sort('resources/sort/file?');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), doubleSorted);
});

test('With \'-n\' option', t => {
  const result = shell.sort('-n', 'resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/sort/sortedDashN').toString());
});

test('With \'-r\' option', t => {
  const result = shell.sort('-r', 'resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/sort/sorted')
    .trimRight()
    .split('\n')
    .reverse()
    .join('\n') + '\n');
});

test('With \'-rn\' option', t => {
  const result = shell.sort('-rn', 'resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('resources/sort/sortedDashN')
    .trimRight()
    .split('\n')
    .reverse()
    .join('\n') + '\n');
});
