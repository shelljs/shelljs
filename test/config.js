import path from 'path';

import test from 'ava';

import shell from '..';
import common from '../src/common';
import utils from './utils/utils';

//
// Valids
//

//
// config.silent
//

test('config.silent is false by default', t => {
  t.falsy(shell.config.silent);
});

test('config.silent can be set to true', t => {
  shell.config.silent = true;
  t.truthy(shell.config.silent);
});

test('config.silent can be set to false', t => {
  shell.config.silent = false;
  t.falsy(shell.config.silent);
});

//
// config.fatal
//

test.cb('config.fatal = false', t => {
  t.falsy(shell.config.fatal);
  const script = 'require(\'./global.js\'); config.silent=true; config.fatal=false; cp("this_file_doesnt_exist", "."); echo("got here");';
  utils.runScript(script, (err, stdout) => {
    t.truthy(stdout.match('got here'));
    t.end();
  });
});

test.cb('config.fatal = true', t => {
  const script = 'require(\'./global.js\'); config.silent=true; config.fatal=true; cp("this_file_doesnt_exist", "."); echo("got here");';
  utils.runScript(script, (err, stdout) => {
    t.falsy(stdout.match('got here'));
    t.end();
  });
});

test('config.fatal = false with an exec() failure returns, does not throw', t => {
  const expected = { code: 2 };
  t.notThrows(() => {
    const result = shell.exec('exit 2');
    t.is(result.code, expected.code);
  });
});

test('config.fatal = true with an exec() failure includes a .code on the Error', t => {
  shell.config.fatal = true;
  try {
    t.throws(() => {
      shell.exec('exit 2');
    }, { code: 2 });
  } finally {
    shell.config.fatal = false;
  }
});

//
// config.globOptions
//

test('config.globOptions expands directories by default', t => {
  const result = common.expand(['test/resources/*a*']);
  const expected = [
    'test/resources/a.txt',
    'test/resources/badlink',
    'test/resources/cat',
    'test/resources/external',
    'test/resources/head',
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects cwd', t => {
  // Both node-glob and fast-glob call this option 'cwd'.
  shell.config.globOptions = { cwd: 'test' };
  const result = common.expand(['resources/*a*']);
  const expected = [
    'resources/a.txt',
    'resources/badlink',
    'resources/cat',
    'resources/external',
    'resources/head',
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects dot', t => {
  // Both node-glob and fast-glob call this option 'dot'.
  shell.config.globOptions = { dot: true };
  const result = common.expand(['test/resources/ls/*']);
  t.is(result.length, 8);
  t.truthy(result.indexOf('test/resources/ls/.hidden_dir') > -1);
  t.truthy(result.indexOf('test/resources/ls/.hidden_file') > -1);
});

test('config.globOptions respects ignore', t => {
  // Both node-glob and fast-glob call this option 'ignore'.
  shell.config.globOptions = { ignore: ['test/resources/external'] };
  const result = common.expand(['test/resources/*a*']);
  const expected = [
    'test/resources/a.txt',
    'test/resources/badlink',
    'test/resources/cat',
    'test/resources/head',
  ];
  t.deepEqual(result, expected);
  // Does not include the result that we chose to ignore
  t.truthy(result.indexOf('test/resources/external') < 0);
});

test('config.globOptions respects absolute', t => {
  // Both node-glob and fast-glob call this option 'absolute'.
  shell.config.globOptions = { absolute: true };
  const result = common.expand(['test/resources/*a*']);
  function abs(file) {
    // Normalize to posix-style path separators on all platforms.
    const CWD = process.platform === 'win32' ?
        process.cwd().replace(/\\/g, '/') :
        process.cwd();
    return path.posix.join(CWD, file);
  }
  const expected = [
    abs('test/resources/a.txt'),
    abs('test/resources/badlink'),
    abs('test/resources/cat'),
    abs('test/resources/external'),
    abs('test/resources/head'),
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects nodir', t => {
  shell.config.globOptions = { nodir: true };
  const result = common.expand(['test/resources/*a*']);
  // Includes files and symlinks.
  const expected = [
    'test/resources/a.txt',
    'test/resources/badlink',
  ];
  t.deepEqual(result, expected);
  // Does not include the directories.
  t.truthy(result.indexOf('test/resources/cat') < 0);
  t.truthy(result.indexOf('test/resources/head') < 0);
  t.truthy(result.indexOf('test/resources/external') < 0);
});

test('config.globOptions respects mark', t => {
  shell.config.globOptions = { mark: true };
  const result = common.expand(['test/resources/*a*']);
  // Directories get a '/' character at the end.
  const expected = [
    'test/resources/a.txt',
    'test/resources/badlink',
    'test/resources/cat/',
    'test/resources/external/',
    'test/resources/head/',
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects nobrace', t => {
  // Default behavior is to expand "file{1..2}.txt" to ["file1.txt",
  // "file2.txt"].
  let result = common.expand(['test/resources/file{1..2}.txt']);
  let expected = [
    'test/resources/file1.txt',
    'test/resources/file2.txt',
  ];
  t.deepEqual(result, expected);

  // When 'nobrace' is true, brace expressions will expand as literals.
  shell.config.globOptions = { nobrace: true };
  result = common.expand(['test/resources/file{1..2}.txt']);
  expected = [
    'test/resources/file{1..2}.txt',
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects noglobstar', t => {
  // Default behavior is to expand "**" to match zero or more directories.
  let result = common.expand(['test/**/file1']);
  let expected = [
    'test/resources/cat/file1',
    'test/resources/chmod/file1',
    'test/resources/cp/file1',
    'test/resources/file1',
    'test/resources/ls/file1',
    'test/resources/sort/file1',
    'test/resources/uniq/file1',
  ];
  t.deepEqual(result, expected);

  // When 'noglobstar' is true, "**" will behave like a regular "*" and matches
  // exactly 1 directory.
  shell.config.globOptions = { noglobstar: true };
  result = common.expand(['test/**/file1']);
  expected = [
    'test/resources/file1',
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects noext', t => {
  // Default behavior is to support fancy glob patterns (like "file1.+(js|txt)").
  let result = common.expand([
    'test/resources/file1.+(js|txt)',
    'test/resources/file2.*',
  ]);
  let expected = [
    'test/resources/file1.js',
    'test/resources/file1.txt',
    'test/resources/file2.js',
    'test/resources/file2.txt',
  ];
  t.deepEqual(result, expected);

  // When 'noext' is true, this only matches regular globs (like "file2.*").
  shell.config.globOptions = { noext: true };
  result = common.expand([
    'test/resources/file1.+(js|txt)',
    'test/resources/file2.*',
  ]);
  expected = [
    'test/resources/file1.+(js|txt)',
    'test/resources/file2.js',
    'test/resources/file2.txt',
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects nocase', t => {
  // Default behavior will change depending on macOS, Windows, or Linux. This is
  // difficult to test in a cross-platform way.

  // When 'nocase' is true, we should be able to match files even if we use the
  // wrong case in the pattern.
  shell.config.globOptions = { nocase: true };
  let result = common.expand(['test/resources/FILE*.TXT']);
  let expected = [
    'test/resources/file1.txt',
    'test/resources/file2.txt',
  ];
  t.deepEqual(result, expected);

  // When 'nocase' is false, using the wrong case will fail to match any files.
  shell.config.globOptions = { nocase: false };
  result = common.expand(['test/resources/FILE*.TXT']);
  expected = [
    'test/resources/FILE*.TXT',
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects matchBase', t => {
  // By default, "*" expressions only match inside of the same directory.
  shell.config.globOptions = { cwd: 'test/resources' };
  let result = common.expand(['*ile1']);
  let expected = [
    'file1',
  ];
  t.deepEqual(result, expected);

  // When 'matchBase' is true (and the pattern contains no slashes), the
  // pattern is implicitly treated like "**/*" and will expand to
  // subdirectories.
  shell.config.globOptions = { cwd: 'test/resources', matchBase: true };
  result = common.expand(['*ile1']);
  expected = [
    'cat/file1',
    'chmod/file1',
    'cp/file1',
    'file1',
    'head/shortfile1',
    'ls/file1',
    'sort/file1',
    'uniq/file1',
  ];
  t.deepEqual(result, expected);
});
