const fs = require('fs');

const test = require('ava');

const shell = require('..');
const common = require('../src/common');

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

test("With '-n' option", t => {
  const result = shell.sort('-n', 'test/resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/sort/sortedDashN').toString());
});

test('numerical sort compares signed values instead of their text', t => {
  const result = shell.ShellString('-1\n-2\n-10\n3\n').sort('-n');
  t.is(result.code, 0);
  t.is(result.stdout, '-10\n-2\n-1\n3\n');
});

test('numerical sort compares fractional prefixes', t => {
  const result = shell.ShellString('.9\n0.1\n-.2\n0\n-0.05\n').sort('-n');
  t.is(result.code, 0);
  t.is(result.stdout, '-.2\n-0.05\n0\n0.1\n.9\n');
});

test('reverse numerical sort compares signed fractional prefixes', t => {
  const result = shell.ShellString('-2.5 b\n-2.05 a\n.5 c\n0 d\n').sort('-rn');
  t.is(result.code, 0);
  t.is(result.stdout, '.5 c\n0 d\n-2.05 a\n-2.5 b\n');
});

test('numerical sort skips leading whitespace before signed fractions', t => {
  const result = shell.ShellString('  -1.1 b\n\t-1.2 a\n  .25 c\n2 d\n').sort('-n');
  t.is(result.code, 0);
  t.is(result.stdout, '\t-1.2 a\n  -1.1 b\n  .25 c\n2 d\n');
});

test('numerical sort preserves suffix comparisons and nonnumeric zero values', t => {
  const result = shell.ShellString('2 b\n2 a\nword\n-\n1e3\n+3\n').sort('-n');
  t.is(result.code, 0);
  t.is(result.stdout, '-\n+3\nword\n1e3\n2 a\n2 b\n');
});

test('numerical sort preserves suffix comparisons for equal decimal and zero prefixes', t => {
  const zeros = shell.ShellString('-0 zebra\n0 apple\n-.0 middle\n0.0 berry\n').sort('-n');
  t.is(zeros.code, 0);
  t.is(zeros.stdout, '0 apple\n0.0 berry\n-.0 middle\n-0 zebra\n');
  const decimals = shell.ShellString('2.00 zebra\n2.0 apple\n2 middle\n').sort('-n');
  t.is(decimals.code, 0);
  t.is(decimals.stdout, '2.0 apple\n2 middle\n2.00 zebra\n');
});

test('numerical sort compares signed safe-integer boundaries', t => {
  const input = '-9007199254740991\n-9007199254740990\n9007199254740991\n9007199254740990\n';
  const result = shell.ShellString(input).sort('-n');
  t.is(result.code, 0);
  t.is(result.stdout, '-9007199254740991\n-9007199254740990\n9007199254740990\n9007199254740991\n');
});

test('numerical sort keeps the existing integer precision and exponent treatment', t => {
  const large = shell.ShellString('9007199254740993 zebra\n9007199254740992 apple\n').sort('-n');
  t.is(large.code, 0);
  t.is(large.stdout, '9007199254740992 apple\n9007199254740993 zebra\n');
  const prefixes = shell.ShellString('3e-2\n2\n1e3\n+3\n--3\n').sort('-n');
  t.is(prefixes.code, 0);
  t.is(prefixes.stdout, '--3\n+3\n1e3\n2\n3e-2\n');
});

test("With '-r' option", t => {
  const result = shell.sort('-r', 'test/resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/sort/sorted')
    .trimRight()
    .split('\n')
    .reverse()
    .join('\n') + '\n');
});

test("With '-rn' option", t => {
  const result = shell.sort('-rn', 'test/resources/sort/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), shell.cat('test/resources/sort/sortedDashN')
    .trimRight()
    .split('\n')
    .reverse()
    .join('\n') + '\n');
});
