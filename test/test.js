import test from 'ava';

import shell from '..';

shell.config.silent = true;

//
// Invalids
//

test('no expression given', t => {
  shell.test();
  t.truthy(shell.error());
});

test('bad expression', t => {
  shell.test('asdf');
  t.truthy(shell.error());
});

test('bad expression #2', t => {
  shell.test('f', 'resources/file1');
  t.truthy(shell.error());
});

test('no file', t => {
  shell.test('-f');
  t.truthy(shell.error());
});

//
// Valids
//


test('-e option succeeds for files', t => {
  const result = shell.test('-e', 'resources/file1');
  t.falsy(shell.error());
  t.truthy(result);
});

test('-e option fails if it does not exist', t => {
  const result = shell.test('-e', 'resources/404');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-d option succeeds for a directory', t => {
  const result = shell.test('-d', 'resources');
  t.falsy(shell.error());
  t.truthy(result);
});

test('-f option fails for a directory', t => {
  const result = shell.test('-f', 'resources');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-L option fails for a directory', t => {
  const result = shell.test('-L', 'resources');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-d option fails for a file', t => {
  const result = shell.test('-d', 'resources/file1');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-f option succeeds for a file', t => {
  const result = shell.test('-f', 'resources/file1');
  t.falsy(shell.error());
  t.truthy(result);
});

test('-L option fails for a file', t => {
  const result = shell.test('-L', 'resources/file1');
  t.falsy(shell.error());
  t.falsy(result);
});

test('test command is not globbed', t => {
  // regression #529
  const result = shell.test('-f', 'resources/**/*.js');
  t.falsy(shell.error());
  t.falsy(result);
});

// TODO(nate): figure out a way to test links on Windows
test('-d option fails for a link', t => {
  if (process.platform !== 'win32') {
    const result = shell.test('-d', 'resources/link');
    t.falsy(shell.error());
    t.falsy(result);
  }
});

test('-f option succeeds for a link', t => {
  if (process.platform !== 'win32') {
    const result = shell.test('-f', 'resources/link');
    t.falsy(shell.error());
    t.truthy(result);
  }
});

test('-L option succeeds for a symlink', t => {
  if (process.platform !== 'win32') {
    const result = shell.test('-L', 'resources/link');
    t.falsy(shell.error());
    t.truthy(result);
  }
});

test('-L option works for broken symlinks', t => {
  if (process.platform !== 'win32') {
    const result = shell.test('-L', 'resources/badlink');
    t.falsy(shell.error());
    t.truthy(result);
  }
});

test('-L option fails for missing files', t => {
  if (process.platform !== 'win32') {
    const result = shell.test('-L', 'resources/404');
    t.falsy(shell.error());
    t.falsy(result);
  }
});
