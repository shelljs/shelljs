import test from 'ava';
import shell from '..';
import common from '../src/common';

test.beforeEach(() => {
  shell.config.silent = true;
});

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


test('-e option (exists)', t => {
  const result = shell.test('-e', 'resources/file1');
  t.falsy(shell.error());
  t.is(result, true);// true
});

test('-e option (does not exist)', t => {
  const result = shell.test('-e', 'resources/404');
  t.falsy(shell.error());
  t.is(result, false);
});

test('-d option (directory)', t => {
  const result = shell.test('-d', 'resources');
  t.falsy(shell.error());
  t.is(result, true);// true
});

test('-f option fails for a directory', t => {
  const result = shell.test('-f', 'resources');
  t.falsy(shell.error());
  t.is(result, false);
});

test('-L option fails for a directory', t => {
  const result = shell.test('-L', 'resources');
  t.falsy(shell.error());
  t.is(result, false);
});

test('-d option fails for a file', t => {
  const result = shell.test('-d', 'resources/file1');
  t.falsy(shell.error());
  t.is(result, false);
});

test('-f option (file)', t => {
  const result = shell.test('-f', 'resources/file1');
  t.falsy(shell.error());
  t.is(result, true);// true
});

test('-L option fails for a file', t => {
  const result = shell.test('-L', 'resources/file1');
  t.falsy(shell.error());
  t.is(result, false);
});

test('test command is not globbed', t => {
  // regression #529
  const result = shell.test('-f', 'resources/**/*.js');
  t.falsy(shell.error());
  t.is(result, false);
});

test('-d option fails for a link', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-d', 'resources/link');
    t.falsy(shell.error());
    t.is(result, false);
  }
});

test('-f option succeeds for a link', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-f', 'resources/link');
    t.falsy(shell.error());
    t.is(result, true);// true
  }
});

test('-L option (link)', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-L', 'resources/link');
    t.falsy(shell.error());
    t.is(result, true);// true
  }
});

test('-L option works for broken symlinks', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-L', 'resources/badlink');
    t.falsy(shell.error());
    t.is(result, true);// true
  }
});

test('-L option fails for missing files', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-L', 'resources/404');
    t.falsy(shell.error());
    t.is(result, false);// false
  }
});
