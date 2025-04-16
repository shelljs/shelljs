const fs = require('fs');

const test = require('ava');

const shell = require('..');
const utils = require('./utils/utils');

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.resetForTesting();
  shell.cp('-r', 'test/resources', t.context.tmp);
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
  t.is(shell.errorCode(), 2);
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

test("multiple files, one doesn't exist, one doesn't match", t => {
  const result = shell.grep(/oogabooga/, 'test/resources/file1.txt',
    'test/resources/filedoesnotexist.txt');
  t.truthy(shell.error());
  t.is(result.code, 2);
});

test('-A option, negative value', t => {
  const result = shell.grep('-A', -2, 'test*', 'test/resources/grep/file3');
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.stderr, 'grep: -2: invalid context length argument');
});

test('-B option, negative value', t => {
  const result = shell.grep('-B', -3, 'test*', 'test/resources/grep/file3');
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.stderr, 'grep: -3: invalid context length argument');
});

test('-C option, negative value', t => {
  const result = shell.grep('-C', -1, 'test*', 'test/resources/grep/file3');
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.stderr, 'grep: -1: invalid context length argument');
});

//
// Valids
//

test('basic', t => {
  const result = shell.grep('line', 'test/resources/a.txt');
  t.falsy(shell.error());
  t.is(result.split('\n').length - 1, 4);
});

test('-v option', t => {
  const result = shell.grep('-v', 'line', 'test/resources/a.txt');
  t.falsy(shell.error());
  t.is(result.split('\n').length - 1, 8);
});

test('matches one line', t => {
  const result = shell.grep('line one', 'test/resources/a.txt');
  t.falsy(shell.error());
  t.is(result.toString(), 'This is line one\n');
});

test('multiple files', t => {
  const result = shell.grep(/test/, 'test/resources/file1.txt',
    'test/resources/file2.txt');
  t.falsy(shell.error());
  t.is(result.toString(), 'test1\ntest2\n');
});

test('multiple files, array syntax', t => {
  const result = shell.grep(/test/, ['test/resources/file1.txt',
    'test/resources/file2.txt']);
  t.falsy(shell.error());
  t.is(result.toString(), 'test1\ntest2\n');
});

test('multiple files, glob syntax, * for file name', t => {
  const result = shell.grep(/test/, 'test/resources/file*.txt');
  t.falsy(shell.error());
  t.truthy(result.toString(), 'test1\ntest2\n');
});

test('multiple files, glob syntax, * for directory name', t => {
  const result = shell.grep(/test/, 'test/r*/file*.txt');
  t.falsy(shell.error());
  t.is(result.toString(), 'test1\ntest2\n');
});

test('multiple files, double-star glob', t => {
  const result = shell.grep(/test/, 'test/resources/**/file*.js');
  t.falsy(shell.error());
  t.is(result.toString(), 'test\ntest\ntest\ntest\n');
});

test('one file, * in regex', t => {
  const result = shell.grep(/alpha*beta/, 'test/resources/grep/file');
  t.falsy(shell.error());
  t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
});

test('one file, * in string-regex', t => {
  const result = shell.grep('alpha*beta', 'test/resources/grep/file');
  t.falsy(shell.error());
  t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
});

test('one file, * in regex, make sure * is not globbed', t => {
  const result = shell.grep(/l*\.js/, 'test/resources/grep/file');
  t.falsy(shell.error());
  t.is(result.toString(), 'this line ends in.js\nlllllllllllllllll.js\n');
});

test('one file, * in string-regex, make sure * is not globbed', t => {
  const result = shell.grep('l*\\.js', 'test/resources/grep/file');
  t.falsy(shell.error());
  t.is(result.toString(), 'this line ends in.js\nlllllllllllllllll.js\n');
});

test("one file, pattern doesn't match", t => {
  const result = shell.grep('notfoundstring', 'test/resources/grep/file');
  t.truthy(shell.error());
  t.is(result.toString(), '');
  t.is(result.stdout, '');
  // TODO(#900): "grep: " isn't really the correct stderr output, but we need a
  // non-empty string so `shell.error()` is truthy.
  t.is(result.stderr, 'grep: ');
  t.is(result.code, 1);
});

test('-l option', t => {
  const result = shell.grep('-l', 'test1', 'test/resources/file1', 'test/resources/file2',
    'test/resources/file1.txt');
  t.falsy(shell.error());
  t.truthy(result.match(/file1(\n|$)/));
  t.truthy(result.match(/file1.txt/));
  t.falsy(result.match(/file2.txt/));
  t.is(result.split('\n').length - 1, 2);
});

test('-i option', t => {
  const result = shell.grep('-i', 'test', 'test/resources/grep/case1', 'test/resources/grep/case1.txt',
    'test/resources/grep/case1.js');
  t.falsy(shell.error());
  t.is(result.split('\n').length - 1, 3);
});

test('-n option', t => {
  const result = shell.grep('-n', /alpha*beta/, 'test/resources/grep/file');
  t.falsy(shell.error());
  t.is(result.toString(), '1:alphaaaaaaabeta\n3:alphbeta\n');
});

test('the pattern looks like an option', t => {
  const result = shell.grep('--', '-v', 'test/resources/grep/file2');
  t.falsy(shell.error());
  t.is(result.toString(), '-v\n-vv\n');
});

//
// Before & after contexts
//
test('-B option', t => {
  const result = shell.grep('-B', 3, 'test*', 'test/resources/grep/file3');
  t.falsy(shell.error());
  t.is(
    result.toString(),
    'line1\n' +
      'line2 test line\n' +
      'line3 test line\n' +
      '--\n' +
      'line7\n' +
      'line8\n' +
      'line9\n' +
      'line10 test line\n' +
      '--\n' +
      'line12\n' +
      'line13\n' +
      'line14\n' +
      'line15 test line\n'
  );
});

test('-B option, -n option', t => {
  const result = shell.grep('-nB', 3, 'test*', 'test/resources/grep/file3');
  t.falsy(shell.error());
  t.is(
    result.toString(),
    '1-line1\n' +
      '2:line2 test line\n' +
      '3:line3 test line\n' +
      '--\n' +
      '7-line7\n' +
      '8-line8\n' +
      '9-line9\n' +
      '10:line10 test line\n' +
      '--\n' +
      '12-line12\n' +
      '13-line13\n' +
      '14-line14\n' +
      '15:line15 test line\n'
  );
});

test('-A option', t => {
  const result = shell.grep('-A', 2, 'test*', 'test/resources/grep/file3');
  t.falsy(shell.error());
  t.is(
    result.toString(),
    'line2 test line\n' +
      'line3 test line\n' +
      'line4\n' +
      'line5\n' +
      '--\n' +
      'line10 test line\n' +
      'line11\n' +
      'line12\n' +
      '--\n' +
      'line15 test line\n'
  );
});

test('-A option, -B option', t => {
  const result = shell.grep(
    { '-A': 2, '-B': 3 },
    'test*',
    'test/resources/grep/file3'
  );
  t.falsy(shell.error());
  t.is(
    result.toString(),
    'line1\n' +
      'line2 test line\n' +
      'line3 test line\n' +
      'line4\n' +
      'line5\n' +
      '--\n' +
      'line7\n' +
      'line8\n' +
      'line9\n' +
      'line10 test line\n' +
      'line11\n' +
      'line12\n' +
      'line13\n' +
      'line14\n' +
      'line15 test line\n'
  );
});

test('-A option, -B option, -n option', t => {
  const result = shell.grep(
    { '-n': true, '-A': 2, '-B': 3 },
    'test*',
    'test/resources/grep/file3'
  );
  t.falsy(shell.error());
  t.is(
    result.toString(),
    '1-line1\n' +
      '2:line2 test line\n' +
      '3:line3 test line\n' +
      '4-line4\n' +
      '5-line5\n' +
      '--\n' +
      '7-line7\n' +
      '8-line8\n' +
      '9-line9\n' +
      '10:line10 test line\n' +
      '11-line11\n' +
      '12-line12\n' +
      '13-line13\n' +
      '14-line14\n' +
      '15:line15 test line\n'
  );
});

test('-C option', t => {
  const result = shell.grep('-C', 3, 'test*', 'test/resources/grep/file3');
  t.falsy(shell.error());
  t.is(
    result.toString(),
    'line1\n' +
      'line2 test line\n' +
      'line3 test line\n' +
      'line4\n' +
      'line5\n' +
      'line6\n' +
      'line7\n' +
      'line8\n' +
      'line9\n' +
      'line10 test line\n' +
      'line11\n' +
      'line12\n' +
      'line13\n' +
      'line14\n' +
      'line15 test line\n'
  );
});

test('-C option, small value', t => {
  const result = shell.grep('-C', 1, 'test*', 'test/resources/grep/file3');
  t.falsy(shell.error());
  t.is(
    result.toString(),
    'line1\n' +
      'line2 test line\n' +
      'line3 test line\n' +
      'line4\n' +
      '--\n' +
      'line9\n' +
      'line10 test line\n' +
      'line11\n' +
      '--\n' +
      'line14\n' +
      'line15 test line\n'
  );
});

test('-C option, large value', t => {
  const result = shell.grep('-C', 100, 'test*', 'test/resources/grep/file3');
  t.falsy(shell.error());
  t.is(
    result.toString(),
    'line1\n' +
      'line2 test line\n' +
      'line3 test line\n' +
      'line4\n' +
      'line5\n' +
      'line6\n' +
      'line7\n' +
      'line8\n' +
      'line9\n' +
      'line10 test line\n' +
      'line11\n' +
      'line12\n' +
      'line13\n' +
      'line14\n' +
      'line15 test line\n'
  );
});

test('-C option, add line separators', t => {
  const result = shell.grep('-C', 0, 'test*', 'test/resources/grep/file3');
  t.falsy(shell.error());
  t.is(
    result.toString(),
    'line2 test line\n' +
      'line3 test line\n' +
      '--\n' +
      'line10 test line\n' +
      '--\n' +
      'line15 test line\n'
  );
});

test('-C option, -n option', t => {
  const result = shell.grep('-nC', 3, 'test*', 'test/resources/grep/file3');
  t.falsy(shell.error());
  t.is(
    result.toString(),
    '1-line1\n' +
      '2:line2 test line\n' +
      '3:line3 test line\n' +
      '4-line4\n' +
      '5-line5\n' +
      '6-line6\n' +
      '7-line7\n' +
      '8-line8\n' +
      '9-line9\n' +
      '10:line10 test line\n' +
      '11-line11\n' +
      '12-line12\n' +
      '13-line13\n' +
      '14-line14\n' +
      '15:line15 test line\n'
  );
});
