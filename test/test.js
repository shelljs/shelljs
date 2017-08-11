import test from 'ava';

import shell from '..';
import utils from './utils/utils';

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
