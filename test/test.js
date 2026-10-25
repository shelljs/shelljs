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

test('bad binary expression', t => {
  shell.test('left', '-unknown', 'right');
  t.truthy(shell.error());
});

test('string comparison rejects non-string operands', t => {
  shell.test(1, '=', '1');
  t.truthy(shell.error());
});

test('integer comparison rejects non-integers', t => {
  shell.test('1.5', '-gt', '1');
  t.truthy(shell.error());
});

test('integer comparison rejects unsafe integers', t => {
  // 2 ** 53 exceeds Number.MAX_SAFE_INTEGER, so comparisons may lose precision.
  shell.test('9007199254740992', '-gt', '1');
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

test('file option object remains supported', t => {
  const result = shell.test({ '-f': true }, 'test/resources/file1');
  t.falsy(shell.error());
  t.truthy(result);
});

//
// String comparisons
//

test('= compares strings for equality', t => {
  t.true(shell.test('production', '=', 'production'));
  t.falsy(shell.error());
  t.false(shell.test('production', '=', 'development'));
  t.falsy(shell.error());
  t.true(shell.test('', '=', ''));
  t.falsy(shell.error());
});

test('!= compares strings for inequality', t => {
  t.true(shell.test('hello world', '!=', 'hello'));
  t.falsy(shell.error());
  t.false(shell.test('hello world', '!=', 'hello world'));
  t.falsy(shell.error());
});

test('-n checks for a nonempty string', t => {
  t.true(shell.test('-n', 'value'));
  t.falsy(shell.error());
  t.false(shell.test('-n', ''));
  t.falsy(shell.error());
});

test('-z checks for an empty string', t => {
  t.true(shell.test('-z', ''));
  t.falsy(shell.error());
  t.false(shell.test('-z', 'value'));
  t.falsy(shell.error());
});

//
// Integer comparisons
//

test('integer comparison operators handle true expressions', t => {
  t.true(shell.test('2', '-eq', '2'), '2 -eq 2');
  t.falsy(shell.error());

  t.true(shell.test('2', '-ne', '3'), '2 -ne 3');
  t.falsy(shell.error());

  t.true(shell.test('3', '-gt', '2'), '3 -gt 2');
  t.falsy(shell.error());

  t.true(shell.test('3', '-ge', '3'), '3 -ge 3');
  t.falsy(shell.error());

  t.true(shell.test('2', '-lt', '3'), '2 -lt 3');
  t.falsy(shell.error());

  t.true(shell.test('3', '-le', '3'), '3 -le 3');
  t.falsy(shell.error());
});

test('integer comparison operators handle false expressions', t => {
  t.false(shell.test('2', '-eq', '3'), '2 -eq 3');
  t.falsy(shell.error());

  t.false(shell.test('2', '-ne', '2'), '2 -ne 2');
  t.falsy(shell.error());

  t.false(shell.test('2', '-gt', '3'), '2 -gt 3');
  t.falsy(shell.error());

  t.false(shell.test('3', '-ge', '4'), '3 -ge 4');
  t.falsy(shell.error());

  t.false(shell.test('3', '-lt', '2'), '3 -lt 2');
  t.falsy(shell.error());

  t.false(shell.test('4', '-le', '3'), '4 -le 3');
  t.falsy(shell.error());
});

test('integer comparisons support negative values and numbers', t => {
  t.true(shell.test('-2', '-lt', '-1'));
  t.falsy(shell.error());
  t.true(shell.test('+2', '-eq', 2));
  t.falsy(shell.error());
});
