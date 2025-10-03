const test = require('ava');

const shell = require('..');
const utils = require('./utils/utils');

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
  shell.test('f', 'test/resources/file1');
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
  const result = shell.test('-e', 'test/resources/file1');
  t.falsy(shell.error());
  t.truthy(result);
});

test('-e option fails if it does not exist', t => {
  const result = shell.test('-e', 'test/resources/404');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-d option succeeds for a directory', t => {
  const result = shell.test('-d', 'test/resources');
  t.falsy(shell.error());
  t.truthy(result);
});

test('-f option fails for a directory', t => {
  const result = shell.test('-f', 'test/resources');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-L option fails for a directory', t => {
  const result = shell.test('-L', 'test/resources');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-d option fails for a file', t => {
  const result = shell.test('-d', 'test/resources/file1');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-f option succeeds for a file', t => {
  const result = shell.test('-f', 'test/resources/file1');
  t.falsy(shell.error());
  t.truthy(result);
});

test('-L option fails for a file', t => {
  const result = shell.test('-L', 'test/resources/file1');
  t.falsy(shell.error());
  t.falsy(result);
});

test('test command is not globbed', t => {
  // regression #529
  const result = shell.test('-f', 'test/resources/**/*.js');
  t.falsy(shell.error());
  t.falsy(result);
});

// TODO(nate): figure out a way to test links on Windows
test('-d option fails for a link', t => {
  utils.skipOnWin(t, () => {
    const result = shell.test('-d', 'test/resources/link');
    t.falsy(shell.error());
    t.falsy(result);
  });
});

test('-f option succeeds for a link', t => {
  utils.skipOnWin(t, () => {
    const result = shell.test('-f', 'test/resources/link');
    t.falsy(shell.error());
    t.truthy(result);
  });
});

test('-L option succeeds for a symlink', t => {
  utils.skipOnWin(t, () => {
    const result = shell.test('-L', 'test/resources/link');
    t.falsy(shell.error());
    t.truthy(result);
  });
});

test('-L option works for broken symlinks', t => {
  utils.skipOnWin(t, () => {
    const result = shell.test('-L', 'test/resources/badlink');
    t.falsy(shell.error());
    t.truthy(result);
  });
});

test('-L option fails for missing files', t => {
  utils.skipOnWin(t, () => {
    const result = shell.test('-L', 'test/resources/404');
    t.falsy(shell.error());
    t.falsy(result);
  });
});

//
// String comparison tests
//

test('string equality with = operator', t => {
  const result = shell.test('hello', '=', 'hello');
  t.falsy(shell.error());
  t.truthy(result);
});

test('string equality fails when strings differ', t => {
  const result = shell.test('hello', '=', 'world');
  t.falsy(shell.error());
  t.falsy(result);
});

test('string inequality with != operator', t => {
  const result = shell.test('hello', '!=', 'world');
  t.falsy(shell.error());
  t.truthy(result);
});

test('string inequality fails when strings are equal', t => {
  const result = shell.test('hello', '!=', 'hello');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-n option succeeds for non-empty string', t => {
  const result = shell.test('-n', 'hello');
  t.falsy(shell.error());
  t.truthy(result);
});

test('-n option fails for empty string', t => {
  const result = shell.test('-n', '');
  t.falsy(shell.error());
  t.falsy(result);
});

test('-z option succeeds for empty string', t => {
  const result = shell.test('-z', '');
  t.falsy(shell.error());
  t.truthy(result);
});

test('-z option fails for non-empty string', t => {
  const result = shell.test('-z', 'hello');
  t.falsy(shell.error());
  t.falsy(result);
});

test('environment variable equality check', t => {
  process.env.TEST_VAR = 'production';
  const result = shell.test(process.env.TEST_VAR, '=', 'production');
  t.falsy(shell.error());
  t.truthy(result);
  delete process.env.TEST_VAR;
});

test('environment variable inequality check', t => {
  process.env.TEST_VAR = 'development';
  const result = shell.test(process.env.TEST_VAR, '!=', 'production');
  t.falsy(shell.error());
  t.truthy(result);
  delete process.env.TEST_VAR;
});

test('environment variable non-zero length check', t => {
  process.env.TEST_VAR = 'some_value';
  const result = shell.test('-n', process.env.TEST_VAR);
  t.falsy(shell.error());
  t.truthy(result);
  delete process.env.TEST_VAR;
});

test('empty strings are equal', t => {
  const result = shell.test('', '=', '');
  t.falsy(shell.error());
  t.truthy(result);
});

test('string with spaces equality', t => {
  const result = shell.test('hello world', '=', 'hello world');
  t.falsy(shell.error());
  t.truthy(result);
});

test('error when operator is at beginning', t => {
  shell.test('=', 'hello', 'world');
  t.truthy(shell.error());
});

test('error for invalid expression with three strings', t => {
  shell.test('hello', 'world', 'test');
  t.truthy(shell.error());
});
