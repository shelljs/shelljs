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
  const result = shell.head();
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('file does not exist', t => {
  t.is(fs.existsSync('/asdfasdf'), false); // sanity check
  const result = shell.head('/adsfasdf'); // file does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
});

//
// Valids
//

const topOfFile1 = ['file1 1', 'file1 2', 'file1 3', 'file1 4', 'file1 5',
                  'file1 6', 'file1 7', 'file1 8', 'file1 9', 'file1 10',
                  'file1 11', 'file1 12', 'file1 13', 'file1 14', 'file1 15',
                  'file1 16', 'file1 17', 'file1 18', 'file1 19', 'file1 20'];
const topOfFile2 = ['file2 1', 'file2 2', 'file2 3', 'file2 4', 'file2 5',
                  'file2 6', 'file2 7', 'file2 8', 'file2 9', 'file2 10',
                  'file2 11', 'file2 12', 'file2 13', 'file2 14', 'file2 15',
                  'file2 16', 'file2 17', 'file2 18', 'file2 19', 'file2 20'];

test('simple', t => {
  const result = shell.head('resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile1.slice(0, 10).join('\n') + '\n');
});

test('multiple files', t => {
  const result = shell.head('resources/head/file2.txt', 'resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile2
    .slice(0, 10)
    .concat(topOfFile1.slice(0, 10))
    .join('\n') + '\n');
});

test('multiple files, array syntax', t => {
  const result = shell.head(['resources/head/file2.txt', 'resources/head/file1.txt']);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile2
    .slice(0, 10)
    .concat(topOfFile1.slice(0, 10))
    .join('\n') + '\n');
});

test('reading more lines than are in the file (no trailing newline)', t => {
  const result = shell.head('resources/file2', 'resources/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), 'test2\ntest1'); // these files only have one line (no \n)
});

test('reading more lines than are in the file (with trailing newline)', t => {
  const result = shell.head('resources/head/shortfile2', 'resources/head/shortfile1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), 'short2\nshort1\n'); // these files only have one line (with \n)
});

test('Globbed file', t => {
  const result = shell.head('resources/head/file?.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile1
    .slice(0, 10)
    .concat(topOfFile2.slice(0, 10))
    .join('\n') + '\n');
});

test('With `\'-n\' <num>` option', t => {
  const result = shell.head('-n', 4, 'resources/head/file2.txt', 'resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile2
    .slice(0, 4)
    .concat(topOfFile1.slice(0, 4))
    .join('\n') + '\n');
});

test('With `{\'-n\': <num>}` option', t => {
  const result = shell.head({ '-n': 4 }, 'resources/head/file2.txt', 'resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile2
    .slice(0, 4)
    .concat(topOfFile1.slice(0, 4))
    .join('\n') + '\n');
});

test('negative values (-num) are the same as (numLines - num)', t => {
  const result = shell.head('-n', -46, 'resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), 'file1 1\nfile1 2\nfile1 3\nfile1 4\n');
});
