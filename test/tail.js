import test from 'ava';
import shell from '..';
import fs from 'fs';

test.beforeEach(() => {
  shell.config.silent = true;
});

//
// Invalids
//

test('No Test Title #15', t => {
  const result = shell.tail();
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #16', t => {
  t.is(fs.existsSync('/asdfasdf'), false); // sanity check
  const result = shell.tail('/adsfasdf'); // file does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
});

//
// Valids
//

const bottomOfFile1 = ['file1 50', 'file1 49', 'file1 48', 'file1 47', 'file1 46',
'file1 45', 'file1 44', 'file1 43', 'file1 42', 'file1 41',
'file1 40', 'file1 39', 'file1 38', 'file1 37', 'file1 36',
'file1 35', 'file1 34', 'file1 33', 'file1 32', 'file1 31'];
const bottomOfFile2 = ['file2 50', 'file2 49', 'file2 48', 'file2 47', 'file2 46',
'file2 45', 'file2 44', 'file2 43', 'file2 42', 'file2 41',
'file2 40', 'file2 39', 'file2 38', 'file2 37', 'file2 36',
'file2 35', 'file2 34', 'file2 33', 'file2 32', 'file2 31'];

test('simple', t => {
  const result = shell.tail('resources/head/file1.txt');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), bottomOfFile1.slice(0, 10).reverse().join('\n') + '\n');
});

test('multiple files', t => {
  const result = shell.tail('resources/head/file2.txt', 'resources/head/file1.txt');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(),
    bottomOfFile2
      .slice(0, 10)
      .reverse()
      .concat(bottomOfFile1.slice(0, 10).reverse())
      .join('\n') + '\n');
});

test('multiple files, array syntax', t => {
  const result = shell.tail(['resources/head/file2.txt', 'resources/head/file1.txt']);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(),
    bottomOfFile2
      .slice(0, 10)
      .reverse()
      .concat(bottomOfFile1.slice(0, 10).reverse())
      .join('\n') + '\n');
});

test('reading more lines than are in the file (no trailing newline)', t => {
  const result = shell.tail('resources/file2', 'resources/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'test2\ntest1'); // these files only have one line (no \n)
});

test('reading more lines than are in the file (with trailing newline)', t => {
  const result = shell.tail('resources/head/shortfile2', 'resources/head/shortfile1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'short2\nshort1\n'); // these files only have one line (with \n)
});

test('Globbed file', t => {
  const result = shell.tail('resources/head/file?.txt');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(),
    bottomOfFile1
      .slice(0, 10)
      .reverse()
      .concat(bottomOfFile2.slice(0, 10).reverse())
      .join('\n') + '\n');
});

test('With `\'-n\' <num>` option', t => {
  const result = shell.tail('-n', 4, 'resources/head/file2.txt', 'resources/head/file1.txt');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(),
    bottomOfFile2
      .slice(0, 4)
      .reverse()
      .concat(bottomOfFile1.slice(0, 4).reverse())
      .join('\n') + '\n');
});

test('With `{\'-n\': <num>}` option', t => {
  const result = shell.tail({ '-n': 4 }, 'resources/head/file2.txt', 'resources/head/file1.txt');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(),
    bottomOfFile2
      .slice(0, 4)
      .reverse()
      .concat(bottomOfFile1.slice(0, 4).reverse())
      .join('\n') + '\n');
});

test('negative values are the same as positive values', t => {
  const result = shell.tail('-n', -4, 'resources/head/file2.txt', 'resources/head/file1.txt');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(),
    bottomOfFile2
      .slice(0, 4)
      .reverse()
      .concat(bottomOfFile1.slice(0, 4).reverse())
      .join('\n') + '\n');
});
