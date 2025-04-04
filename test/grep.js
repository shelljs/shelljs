import fs from 'fs';

import test from 'ava';

import shell from '..';
import utils from './utils/utils';

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
const contextOptions = ['test*', 'test/resources/grep/file3'];

// key is expected results and value is an array of arguments to test
const beforeAndAfterTests = {
  // before context
  'line1\nline2 test line\n--\nline1\nline2 test line\nline3 test line\n--\nline7\nline8\nline9\nline10 test line\n--\nline12\nline13\nline14\nline15 test line\n':
    [['-B3'], ['-B', 3], ['-B3i'], ['-Bi', 3], ['-iB3'], ['-iB', 3]],
  // before context + line numbers
  '1-line1\n2:line2 test line\n--\n1-line1\n2-line2 test line\n3:line3 test line\n--\n7-line7\n8-line8\n9-line9\n10:line10 test line\n--\n12-line12\n13-line13\n14-line14\n15:line15 test line\n':
    [
      ['-B3n'],
      ['-Bn', 3],
      ['-B3ni'],
      ['-Bni', 3],
      ['-nB3'],
      ['-nB', 3],
      ['-niB3'],
      ['-niB', 3],
    ],
  // after context
  'line2 test line\nline3 test line\nline4\n--\nline3 test line\nline4\nline5\n--\nline10 test line\nline11\nline12\n--\nline15 test line\n\n':
    [['-A2'], ['-A', 2], ['-A2i'], ['-Ai', 2], ['-iA2'], ['-iA', 2]],
  // after context + line numbers
  '2:line2 test line\n3-line3 test line\n4-line4\n--\n3:line3 test line\n4-line4\n5-line5\n--\n10:line10 test line\n11-line11\n12-line12\n--\n15:line15 test line\n\n':
    [
      ['-A2n'],
      ['-An', 2],
      ['-A2ni'],
      ['-Ani', 2],
      ['-nA2'],
      ['-nA', 2],
      ['-niA2'],
      ['-niA', 2],
    ],
  // before + after same value
  'line1\nline2 test line\nline3 test line\nline4\nline5\n--\nline1\nline2 test line\nline3 test line\nline4\nline5\nline6\n--\nline7\nline8\nline9\nline10 test line\nline11\nline12\nline13\n--\nline12\nline13\nline14\nline15 test line\n\n':
    [
      ['-AB3'],
      ['-AB', 3],
      ['-BA3'],
      ['-BA', 3],
      ['-AB3i'],
      ['-ABi', 3],
      ['-BA3i'],
      ['-BAi', 3],
      ['-iAB3'],
      ['-iAB', 3],
      ['-iBA3'],
      ['-iBA', 3],
    ],
  // before + after different values
  'line1\nline2 test line\nline3 test line\nline4\n--\nline1\nline2 test line\nline3 test line\nline4\nline5\n--\nline7\nline8\nline9\nline10 test line\nline11\nline12\n--\nline12\nline13\nline14\nline15 test line\n\n':
    [
      ['-A2B3'],
      ['-A2', '-B3'],
      ['-A', 2, '-B', 3],
      ['-A2B3i'],
      ['-A2', '-B3', '-i'],
      ['-A', 2, '-B', 3, '-i'],
      ['-iA2B3'],
      ['-i', '-A2', '-B3'],
      ['-i', '-A', 2, '-B', 3],
    ],
  // before + after + line numbers same value
  '1-line1\n2:line2 test line\n3-line3 test line\n4-line4\n5-line5\n--\n1-line1\n2-line2 test line\n3:line3 test line\n4-line4\n5-line5\n6-line6\n--\n7-line7\n8-line8\n9-line9\n10:line10 test line\n11-line11\n12-line12\n13-line13\n--\n12-line12\n13-line13\n14-line14\n15:line15 test line\n\n':
    [
      ['-AB3n'],
      ['-nAB3'],
      ['-n', '-AB3'],
      ['-n', '-AB', 3],
      ['-nAB', 3],
      ['-AB3ni'],
      ['-niAB3'],
      ['-ni', '-AB3'],
      ['-ni', '-AB', 3],
    ],
  // before + after + line numbers different values
  '1-line1\n2:line2 test line\n3-line3 test line\n4-line4\n--\n1-line1\n2-line2 test line\n3:line3 test line\n4-line4\n5-line5\n--\n7-line7\n8-line8\n9-line9\n10:line10 test line\n11-line11\n12-line12\n--\n12-line12\n13-line13\n14-line14\n15:line15 test line\n\n':
    [
      ['-A2B3n'],
      ['-A2', '-B3', '-n'],
      ['-A', 2, '-B', 3, '-n'],
      ['-nA2B3'],
      ['-n', '-A2', '-B3'],
      ['-n', '-A', 2, '-B', 3],
      ['-nA2', '-B3'],
      ['-nA', 2, '-B', 3],
      ['-A2', '-nB3'],
      ['-A', 2, '-nB', 3],
      ['-A2n', '-B3'],
      ['-An', 2, '-B', 3],
      ['-A2', '-B3n'],
      ['-A', 2, '-Bn', 3],
      ['-A2B3in'],
      ['-A2', '-B3', '-in'],
      ['-A', 2, '-B', 3, '-in'],
      ['-inA2B3'],
      ['-in', '-A2', '-B3'],
      ['-in', '-A', 2, '-B', 3],
    ],
};

Object.keys(beforeAndAfterTests).forEach(k => {
  beforeAndAfterTests[k].forEach(v => {
    test(v.join(' '), t => {
      const result = shell.grep(...v, ...contextOptions);
      t.falsy(shell.error());
      t.is(result.toString(), k);
    });
  });
});
