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


test('exists', t => {
  const result = shell.test('-e', 'resources/file1');
  t.is(shell.error(), null);
  t.is(result, true);// true
});

test('No Test Title #35', t => {
  const result = shell.test('-e', 'resources/404');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('directory', t => {
  const result = shell.test('-d', 'resources');
  t.is(shell.error(), null);
  t.is(result, true);// true
});

test('No Test Title #36', t => {
  const result = shell.test('-f', 'resources');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('No Test Title #37', t => {
  const result = shell.test('-L', 'resources');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('file', t => {
  const result = shell.test('-d', 'resources/file1');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('No Test Title #38', t => {
  const result = shell.test('-f', 'resources/file1');
  t.is(shell.error(), null);
  t.is(result, true);// true
});

test('No Test Title #39', t => {
  const result = shell.test('-L', 'resources/file1');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('test command is not globbed', t => {
  // regression #529
  const result = shell.test('-f', 'resources/**/*.js');
  t.is(shell.error(), null);
  t.is(result, false);
});

test('No Test Title #39', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-d', 'resources/link');
    t.is(shell.error(), null);
    t.is(result, false);
  }
});

test('No Test Title #39', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-f', 'resources/link');
    t.is(shell.error(), null);
    t.is(result, true);// true
  }
});

test('No Test Title #39', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-L', 'resources/link');
    t.is(shell.error(), null);
    t.is(result, true);// true
  }
});

test('No Test Title #39', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-L', 'resources/badlink');
    t.is(shell.error(), null);
    t.is(result, true);// true
  }
});

test('No Test Title #39', t => {
  if (common.platform !== 'win') {
    const result = shell.test('-L', 'resources/404');
    t.is(shell.error(), null);
    t.is(result, false);// false
  }
});
