import test from 'ava';

import shell from '..';

shell.config.silent = true;

//
// Invalids
//

test('commands like `rm` cannot be on the right side of pipes', t => {
  t.is(shell.ls('.').rm, undefined);
  t.is(shell.cat('test/resources/file1.txt').rm, undefined);
});

//
// Valids
//

test('piping to cat() should return roughly the same thing', t => {
  t.is(
    shell.cat('test/resources/file1.txt').cat().toString(),
    shell.cat('test/resources/file1.txt').toString()
  );
});

test('piping ls() into cat() converts to a string-like object', t => {
  t.is(shell.ls('test/resources/').cat().toString(), shell.ls('test/resources/').stdout);
});

test('grep works in a pipe', t => {
  const result = shell.ls('test/resources/').grep('file1');
  t.is(result.toString(), 'file1\nfile1.js\nfile1.txt\n');
});

test('multiple pipes work', t => {
  const result = shell.ls('test/resources/').cat().grep('file1');
  t.is(result.toString(), 'file1\nfile1.js\nfile1.txt\n');
});

test('Equivalent to a simple grep() test case', t => {
  const result = shell.cat('test/resources/grep/file').grep(/alpha*beta/);
  t.falsy(shell.error());
  t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
});

test('Equivalent to a simple sed() test case', t => {
  const result = shell.cat('test/resources/grep/file').sed(/l*\.js/, '');
  t.falsy(shell.error());
  t.is(
    result.toString(),
    'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n'
  );
});

test('Sort a file by frequency of each line', t => {
  const result = shell.sort('test/resources/uniq/pipe').uniq('-c').sort('-n');
  t.falsy(shell.error());
  t.is(result.toString(), shell.cat('test/resources/uniq/pipeSorted').toString());
});

test('Synchronous exec', t => {
  const result = shell.cat('test/resources/grep/file').exec('shx grep "alpha*beta"');
  t.falsy(shell.error());
  t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
});

test.cb('Asynchronous exec', t => {
  shell.cat('test/resources/grep/file').exec('shx grep "alpha*beta"', (code, stdout) => {
    t.is(code, 0);
    t.is(stdout, 'alphaaaaaaabeta\nalphbeta\n');
    t.end();
  });
});
