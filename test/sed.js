import test from 'ava';
import shell from '..';
import fs from 'fs';

let TMP;

test.beforeEach(() => {
  TMP = require('./utils/utils').getTempDir();
  shell.config.silent = true;

  shell.rm('-rf', TMP);
  shell.cp('-r', 'resources', TMP);
});


//
// Invalids
//

test('No Test Title #1', t => {
  const result = shell.sed();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.truthy(result.stderr);
});

test('No Test Title #2', t => {
  const result = shell.sed(/asdf/g); // too few args
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #3', t => {
  const result = shell.sed(/asdf/g, 'nada'); // too few args
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('No Test Title #4', t => {
  t.is(fs.existsSync('asdfasdf'), false); // sanity check
  const result = shell.sed(/asdf/g, 'nada', 'asdfasdf'); // no such file
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.stderr, 'sed: no such file or directory: asdfasdf');
});

test('if at least one file is missing, this should be an error', t => {
  t.is(fs.existsSync('asdfasdf'), false); // sanity check
  t.is(fs.existsSync(`${TMP}/file1`), true); // sanity check
  const result = shell.sed(/asdf/g, 'nada', `${TMP}/file1`, 'asdfasdf');
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.stderr, 'sed: no such file or directory: asdfasdf');
});

//
// Valids
//

test('No Test Title #5', t => {
  const result = shell.sed('test1', 'hello', `${TMP}/file1`); // search string
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello');
});

test('No Test Title #6', t => {
  const result = shell.sed(/test1/, 'hello', `${TMP}/file1`); // search regex
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello');
});

test('No Test Title #7', t => {
  const result = shell.sed(/test1/, 1234, `${TMP}/file1`); // numeric replacement
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), '1234');
});

test('No Test Title #8', t => {
  function replaceFun(match) {
    return match.toUpperCase() + match;
  }
  const result = shell.sed(/test1/, replaceFun, `${TMP}/file1`); // replacement function
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'TEST1test1');
});

test('No Test Title #9', t => {
  const result = shell.sed('-i', /test1/, 'hello', `${TMP}/file1`);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello');
  t.is(shell.cat(`${TMP}/file1`).toString(), 'hello');
});

test('make sure * in regex is not globbed', t => {
  const result = shell.sed(/alpha*beta/, 'hello', 'resources/grep/file');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(
    result.toString(),
    'hello\nhowareyou\nhello\nthis line ends in.js\nlllllllllllllllll.js\n'
  );
});

test('make sure * in string-regex is not globbed', t => {
  const result = shell.sed('alpha*beta', 'hello', 'resources/grep/file');
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(
    result.toString(),
    'hello\nhowareyou\nhello\nthis line ends in.js\nlllllllllllllllll.js\n'
  );
});

test('make sure * in regex is not globbed', t => {
  const result = shell.sed(/l*\.js/, '', 'resources/grep/file');
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(
    result.toString(),
    'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n'
  );
});

test('make sure * in string-regex is not globbed', t => {
  const result = shell.sed('l*\\.js', '', 'resources/grep/file');
  t.truthy(!shell.error());
  t.is(result.code, 0);
  t.is(
    result.toString(),
    'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n'
  );
});

test('multiple file names', t => {
  const result = shell.sed('test', 'hello', `${TMP}/file1`, `${TMP}/file2`);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello1\nhello2');
});

test('array of file names (and try it out with a simple regex)', t => {
  const result = shell.sed(/t.*st/, 'hello', [`${TMP}/file1`, `${TMP}/file2`]);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello1\nhello2');
});

test('multiple file names, with in-place-replacement', t => {
  const result = shell.sed('-i', 'test', 'hello', [`${TMP}/file1`, `${TMP}/file2`]);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello1\nhello2');
  t.is(shell.cat(`${TMP}/file1`).toString(), 'hello1');
  t.is(shell.cat(`${TMP}/file2`).toString(), 'hello2');
});

test('glob file names, with in-place-replacement', t => {
  t.is(shell.cat(`${TMP}/file1.txt`).toString(), 'test1\n');
  t.is(shell.cat(`${TMP}/file2.txt`).toString(), 'test2\n');
  const result = shell.sed('-i', 'test', 'hello', `${TMP}/file*.txt`);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'hello1\n\nhello2\n'); // TODO: fix sed's behavior
  t.is(shell.cat(`${TMP}/file1.txt`).toString(), 'hello1\n');
  t.is(shell.cat(`${TMP}/file2.txt`).toString(), 'hello2\n');
});
